import * as fs from 'fs';
import { StepDefinitions } from 'jest-cucumber';
import { sign } from 'jsonwebtoken';
import * as _ from 'lodash';
// @ts-ignore
import { Container, FirebaseUser } from './container';
import { mockMailer, mockStorage, setUserCreateId } from './mocks';

export const steps: StepDefinitions = ({ given, and, when, then }) => {
  given(/the world is beautiful/, () => {
    Container.new();
    process.env = {};
    mockStorage();
    mockMailer();
  });

  given(/environment variables are set as follows:/, (table: []) => {
    table.forEach((row: { EnvVar: string; Value: string }) => {
      process.env[row.EnvVar] = row.Value;
    });
  });

  given(
    /a file "([^"]*)" in bucket "([^"]*)" where data matches file (.*)/,
    (fileName: string, bucket: string, fileLocation: string) => {
      const file = fs.readFileSync(fileLocation).toString();
      const parsedFile = JSON.parse(file);

      Container.get().addBucketData(
        bucket,
        fileName,
        parsedFile,
        parsedFile.metadata
          ? { metadata: parsedFile.metadata }
          : { metadata: { timeCreated: new Date().toISOString() } },
        false
      );
      Container.get().setLastGivenFile({ fileName, value: Container.get().getBucketData()[bucket][fileName] });
    }
  );

  given(/a file "([^"]*)" in bucket "([^"]*)" with payload:/, (fileName: string, bucket: string, data: string) => {
    const parsedFile = JSON.parse(data);
    Container.get().addBucketData(
      bucket,
      fileName,
      parsedFile,
      parsedFile.metadata ? { metadata: parsedFile.metadata } : { metadata: { timeCreated: new Date().toISOString() } },
      false
    );
    Container.get().setLastGivenFile({ fileName, value: Container.get().getBucketData()[bucket][fileName] });
  });

  given(
    /the last given file contains attribute "([^"]*)" with (string|number) value "([^"]*)"/,
    (attribute: string, type: string, value: string) => {
      const lastFile = Container.get().getLastGivenFile();
      lastFile.value['data'][attribute] = type === 'number' ? Number(value) : value;
    }
  );

  given(
    /the last given file contains metadata attribute "([^"]*)" with value "([^"]*)"/,
    (attribute: string, value: string) => {
      const lastFile = Container.get().getLastGivenFile();
      let metadata = lastFile.value.__test_options?.metadata;
      if (!metadata) {
        metadata = {};
      }
      switch (value) {
        case '${now}':
          metadata[attribute] = new Date();
          break;
        default:
          metadata[attribute] = value;
      }
      lastFile.value.__test_options = { ...lastFile.value.__test_options, metadata };
    }
  );

  given(/a request payload matches file (.*)/, (filename) => {
    const file = fs.readFileSync(filename).toString();
    Container.get().getFunctionRequest().body = JSON.parse(file);
  });

  given(/request contains header "([^"]*)" with value "([^"]*)"/, (header: string, headerValue: string) => {
    Container.get().getFunctionRequest().headers[header] = headerValue;
    Container.get().getFunctionRequest().headers[header.toLowerCase()] = headerValue;
  });

  given(/the session contains a valid JWT user-token with a userid "([^"]*)"/, (id: string) => {
    Container.get().setAuthenticatedUser({ uid: id });
    Container.get().addCreatedFirebaseUser({ uid: id, emailVerified: true });
    Container.get().getFunctionRequest().headers['Authorization'] = 'Bearer ' + sign({ sub: id }, 'secret');
  });

  given(
    /the session contains a valid JWT user-token with a userid "([^"]*)" and custom claim "([^"]*)" set to "([^"]*)"/,
    (id: string, claimAttribute: string, claimValue: string) => {
      Container.get().setAuthenticatedUser({ uid: id });
      Container.get().addCreatedFirebaseUser({
        uid: id,
        emailVerified: true,
        customClaims: { [claimAttribute]: claimValue }
      });
      Container.get().getFunctionRequest().headers['Authorization'] =
        'Bearer ' + sign({ sub: id, [claimAttribute]: claimValue }, 'secret');
    }
  );

  given(
    /the session is from a LOCKED user and contains a valid JWT user-token with a userid "([^"]*)"/,
    (id: string) => {
      Container.get().setAuthenticatedUser({ uid: id });
      Container.get().addCreatedFirebaseUser({
        uid: id,
        emailVerified: true,
        customClaims: { locked: true }
      });
      Container.get().getFunctionRequest().headers['Authorization'] =
        'Bearer ' + sign({ sub: id, locked: true }, 'secret');
    }
  );

  given(
    /the session is from a LOCKED user with admin role set to "([^"]*)" and contains a valid JWT user-token with a userid "([^"]*)"/,
    (adminRole: string, id: string) => {
      Container.get().setAuthenticatedUser({ uid: id });
      Container.get().addCreatedFirebaseUser({
        uid: id,
        emailVerified: true,
        customClaims: { locked: true, role: adminRole }
      });
      Container.get().getFunctionRequest().headers['Authorization'] =
        'Bearer ' + sign({ sub: id, locked: true, role: adminRole }, 'secret');
    }
  );

  given(
    /a firebase user with with id "([^"]*)", email address "([^"]*)" and name "([^"]*)" exists/,
    (id: string, email: string, name: string) => {
      Container.get().addCreatedFirebaseUser({ uid: id, email, displayName: name, emailVerified: true });
    }
  );

  given(
    /this firebase user has (attribute|custom claim) "([^"]*)" with value "([^"]*)"/,
    (attributeType: string, attribute: string, value: string | boolean) => {
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      const uid = Container.get().getRememberedFirebaseUserId();
      const users = Container.get().getCreatedFirebaseUsers();
      const user = users.find((user: FirebaseUser) => user.uid === uid);
      if (attributeType === 'attribute') {
        user[attribute] = value;
      } else if (attributeType === 'custom claim') {
        if (!user.customClaims) {
          user.customClaims = {};
        }
        user.customClaims[attribute] = value;
      }
    }
  );

  given(/newly created user should have id "([^"]*)"/, (id: string) => {
    setUserCreateId(id);
  });

  then(
    /a NOT verified firebase user should be created with email "([^"]*)", password "([^"]*)" and displayName "([^"]*)"/,
    (email: string, password: string, displayName: string) => {
      expect(
        Container.get()
          .getCreatedFirebaseUsers()
          .map((user) => ({
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified,
            password: user.password
          }))
      ).toContainEqual({
        email,
        password,
        displayName,
        emailVerified: false
      });
    }
  );

  then(
    /a NOT verified firebase user should be created with email "([^"]*)", displayName "([^"]*)" and role "([^"]*)"/,
    (email: string, displayName: string, role: string) => {
      const container = Container.get();
      const user = container.getCreatedFirebaseUsers().find((user: FirebaseUser) => user.email === email);
      expect(user).toBeDefined();
      expect(user.displayName).toEqual(displayName);
      expect(user.customClaims['role']).toEqual(role);
    }
  );

  then(
    /a file "([^"]*)" should be written to bucket "([^"]*)" with payload:/,
    (fileName: string, bucketName: string, payload: string) => {
      const expectedData = JSON.parse(payload);
      const bucket = Container.get().getBucketData()[bucketName];
      if (fileName.includes('${uuid}')) {
        // merge all written files in requested bucket, that have an uuid as the filename to an array.
        const datas = Object.entries(bucket)
          .filter(([writtenFileName, writtenData]) => {
            return (
              writtenData.__test_newlyWritten &&
              new RegExp(
                fileName.replace('${uuid}', '([0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12})'),
                'i'
              ).test(writtenFileName)
            );
          })
          .map(([writtenFileName, writtenObject]) => writtenObject.data);
        expect(datas).toContainEqual(expectedData);
      } else {
        expect(bucket[fileName]['data']).toEqual(expectedData);
        expect(bucket[fileName].__test_newlyWritten).toBeTruthy();
      }
    }
  );

  then(/the response status should be "(\d+)"/, (statusCode: string) => {
    expect(Container.get().getFunctionResponse().statusCode).toEqual(Number(statusCode));
  });

  then(
    /the response body should have attribute "([^"]*)" with (string|number) value "([^"]*)"/,
    (attribute: string, type: string, value: string) => {
      let castedValue: string | number = value;
      if (type === 'number') {
        castedValue = Number(value);
      }
      expect(Container.get().getFunctionResponse().body[attribute]).toEqual(castedValue);
    }
  );

  then(/the response body should be:/, (data: string) => {
    expect(Container.get().getFunctionResponse().body).toEqual(JSON.parse(data));
  });

  then(/no file should be written to bucket "([^"]*)"/, (bucket: string) => {
    const writtenFiles = Object.values(Container.get().getBucketData()[bucket] || {}).filter(
      (files) => files.__test_newlyWritten === true
    );
    expect(writtenFiles).toHaveLength(0);
  });

  then(/the bucket "([^"]*)" should contain NO file "([^"]*)"/, (bucket: string, fileName: string) => {
    expect(
      Container.get().getBucketData()[bucket] ? Container.get().getBucketData()[bucket][fileName] : undefined
    ).not.toBeDefined();
  });

  then(
    /the firebase user with id "([^"]*)" should have (attribute|custom claim) "([^"]*)" with value "([^"]*)"/,
    (id: string, attributeType: string, attribute: string, value: string | boolean) => {
      if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }

      const users = Container.get().getCreatedFirebaseUsers();
      const user = users.find((user) => user.uid === id);
      expect(user).toBeDefined();
      if (attributeType === 'attribute') {
        expect(user[attribute]).toEqual(value);
      } else {
        expect(user.customClaims[attribute]).toEqual(value);
      }
    }
  );

  then(
    /the firebase user with id "([^"]*)" should NOT have (attribute|custom claim) "([^"]*)"/,
    (id: string, attributeType: string, attribute: string) => {
      const users = Container.get().getCreatedFirebaseUsers();
      const user = users.find((user) => user.uid === id);
      expect(user).toBeDefined();
      if (attributeType === 'attribute') {
        expect(user[attribute]).not.toBeDefined();
      } else {
        if (user.customClaims) {
          expect(user.customClaims[attribute]).not.toBeDefined();
        } else {
          expect(user.customClaims).not.toBeDefined();
        }
      }
    }
  );

  then(/firebase user with id "([^"]*)" should NOT exist/, (id: string) => {
    expect(
      Container.get()
        .getCreatedFirebaseUsers()
        .find((u) => u.uid === id)
    ).not.toBeDefined();
  });

  then(/an event should be published in topic "([^"]*)" with payload:/, (topic: string, data: string) => {
    const topicData = Container.get().getPubSubData()[topic];
    expect(topicData).toBeDefined();
    const datas = topicData.map((value: string) => JSON.parse(Buffer.from(value, 'base64').toString()));
    expect(datas).toContainEqual(JSON.parse(data));
  });

  then(/no event should be published in topic "([^"]*)"/, (topic: string) => {
    const topicData = Container.get().getPubSubData()[topic];
    expect(topicData).not.toBeDefined();
  });
};
