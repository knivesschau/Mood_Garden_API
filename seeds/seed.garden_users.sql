BEGIN;

TRUNCATE
    rose_entries,
    garden_users
    RESTART IDENTITY CASCADE;

INSERT INTO garden_users (user_name, password) (
    VALUES
        ('test_user1', 'testerPassword123'),
        ('test_user2', 'passwordTester431'),
        ('test_user3', 'IloveTestData35'),
        ('test_user4', 'MockDataFan32')
);

INSERT INTO rose_entries (rose, bud, thorn, color, author_id) (
    VALUES
        (
            'This is a test entry for protected endpoints 1',
            'This is a test entry for protected endpoints 1',
            'This is a test entry for protected endpoints 1',
            'Red',
            1
        ),
        (
            'This is a test entry for protected endpoints 2',
            'This is a test entry for protected endpoints 2',
            'This is a test entry for protected endpoints 2',
            'Yellow',
            2
        ),
        (
            'This is a test entry for protected endpoints 3',
            'This is a test entry for protected endpoints 3',
            'This is a test entry for protected endpoints 3',
            'Purple',
            3
        ),
        (
            'This is a test entry for protected endpoints 4',
            'This is a test entry for protected endpoints 4',
            'This is a test entry for protected endpoints 4',
            'Pink',
            4
        )
);

COMMIT;
