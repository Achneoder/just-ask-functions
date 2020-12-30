Feature: Publish Question

  Scenario: Create QuestionPoolItem and Pub/Sub Event
    Given the world is beautiful
    And environment variables are set as follows:
      | EnvVar                      | Value               |
      | QUESTION_POOL_BUCKET        | question-pool       |
      | RECEIVED_ANSWERS_BUCKET     | received-answers    |
    And a file "cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258.json" in bucket "question-pool" with payload:
    """
    {
      "askedBy": "userD",
      "assignees": ["userA"]
    }
    """
    And a file "userA/cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258/d0405903-874a-4d57-9881-ce9a03f14847.json" in bucket "given-answers" with payload:
    """
    {
      "title": "Lorem ipsum",
      "content": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat."
    }
    """
    When a write event for file "userA/cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258/d0405903-874a-4d57-9881-ce9a03f14847.json" is triggered on bucket "given-answers"
    Then a file "userD/cbe44ed5-14c7-47fc-b1e1-8b52ce9f1258/userA/d0405903-874a-4d57-9881-ce9a03f14847.json" should be written to bucket "received-answers" with payload:
    """
    {
      "title": "Lorem ipsum",
      "content": "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat."
    }
    """