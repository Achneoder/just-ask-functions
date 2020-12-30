Feature: Trigger re-assignment

  Scenario: Deleted assigned question triggers re-assignment
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                      | Value               |
      | QUESTION_ASSIGNMENT_TOPIC   | question-assignment |
    And a file "userA/cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" in bucket "assigned-questions" with payload:
    """
    {
      "title": "Lorem ipsum",
      "content": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.",
      "language": "de_DE"
    }
    """
    When a delete event for file "userA/cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" is triggered on bucket "assigned-questions"
    And an event should be published in topic "question-assignment" with payload:
    """
    {
      "questionId": "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258"
    }
    """
