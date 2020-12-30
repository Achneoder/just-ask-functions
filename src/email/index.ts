import { ObjectReader } from 'gcp-object-storage';
import { createTransport } from 'nodemailer';
import * as SMTPPool from 'nodemailer/lib/smtp-pool';
import { EmailType } from '../core/email/emailType.enum';
import { EmailTrigger } from '../core/email/interfaces/email-trigger.interface';
import { getActivationLink, getPasswordResetLink, getUser } from '../core/firebase';
import ejs = require('ejs');
import { BucketEvent } from '../core/interfaces/gcp/bucket-event.interface';

let objectReader: ObjectReader;

export async function handleEvent(data: BucketEvent): Promise<void> {
  if (!objectReader) {
    objectReader = new ObjectReader();
  }

  try {
    const eventFile = await objectReader.readObject<EmailTrigger>(data.bucket, data.name);
    const user = await getUser(eventFile.firebaseUserId);
    const userEmail = user.email;
    let link;
    let subject;
    if (eventFile.trigger === EmailType.USER_REGISTRATION) {
      link = await getActivationLink(user.email, eventFile.callbackUri);
      subject = 'Your Just-Ask registration';
    } else if (eventFile.trigger === EmailType.PASSWORD_RESET) {
      link = await getPasswordResetLink(user.email, eventFile.callbackUri);
      subject = 'Just-Ask password reset';
    }

    const body: string = await new Promise((resolve, reject) => {
      ejs.renderFile(`${__dirname}/${eventFile.trigger}.template.ejs`, { link }, (err: Error | null, str: string) => {
        if (err) {
          reject(err);
        } else {
          resolve(str);
        }
      });
    });
    const mailTransporter = createTransport(<SMTPPool.Options>{
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    await mailTransporter.sendMail({
      from: `"Maurice Bernard" <me@codingoncatnip.de>`,
      to: userEmail,
      subject,
      html: body
    });
  } catch (err) {
    console.error(err);
  }
}
