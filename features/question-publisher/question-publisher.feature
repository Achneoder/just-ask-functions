Feature: Publish Question

  Scenario: Create QuestionPoolItem and Pub/Sub Event
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                      | Value               |
      | QUESTION_POOL_BUCKET        | question-pool       |
      | QUESTION_ASSIGNMENT_TOPIC   | question-assignment |
    And a file "userA/cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" in bucket "own-questions" with payload:
    """
    {
      "title": "Lorem ipsum",
      "content": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.",
      "language": "de_DE"
    }
    """
    When a write event for file "userA/cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" is triggered on bucket "own-questions"
    Then a file "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" should be written to bucket "question-pool" with payload:
    """
    {
      "askedBy": "userA",
      "assignees": []
    }
    """
    And an event should be published in topic "question-assignment" with payload:
    """
    {
      "questionId": "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258"
    }
    """
