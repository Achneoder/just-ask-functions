Feature: Assign question to user

  @excluded
  Scenario: Assign new question to user
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                      | Value               |
      | QUESTION_POOL_BUCKET        | question-pool       |
      | OWN_QUESTIONS_BUCKET        | own-questions       |
      | ASSIGNED_QUESTIONS_BUCKET   | assigned-questions  |
    And a firebase user with with id "userA", email address "existing@user.de" and name "Max Mustermann" exists
    And a firebase user with with id "userB", email address "existing2@user.de" and name "Boaty McBoatface" exists
    And a firebase user with with id "userC", email address "existing3@user.de" and name "John Wick" exists
    And a file "userA/cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" in bucket "own-questions" with payload:
    """
    {
      "title": "Lorem ipsum",
      "content": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.",
      "language": "de_DE"
    }
    """
    And a file "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" in bucket "questions" with payload:
    """
    {
      "askedBy": "userA",
      "assignees": []
    }
    """
    When the function is triggered by Pub/Sub event with payload:
    """
    {
      "questionId": "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258"
    }
    """
    Then a file "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" should be written to bucket "question-pool", assuming correct attribute "assignees", with payload:
    """
    {
      "askedBy": "userA",
      "assignees": []
    }
    """
    And this file should have attribute "assignees" of value being one of:
    """
    [
      [userB],
      [userC]
    ]
    """
    And a file "${userId}/cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" should be written to bucket "assigned-questions" with payload:
    """
    {
      "title": "Lorem ipsum",
      "content": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.",
      "language": "de_DE"
    }
    """
    And this filename should start with last element of "assignees" of file "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" in bucket "question-pool"
