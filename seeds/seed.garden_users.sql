BEGIN;

TRUNCATE
    rose_entries,
    garden_users
    RESTART IDENTITY CASCADE;

INSERT INTO garden_users (user_name, password) (
    VALUES
        ('test_user1', '$2a$10$q9CFUcFLH2t0..ByGyKhNerQ9vhzKOQjiiUU4uWUWI9KQOIGEXWxy'),
        ('test_user2', '$2a$10$vyBIDdUGmDuJl9EguZg83uNP6jh6p2.KbK4ldXP7Bsngr/YnJh19W'),
        ('test_user3', '$2a$10$ieeSFBoUNcqbS7opcksZnOjJDqwno3vKhCHFasWe8GZMN7CFD0As.'),
        ('test_user4', '$2a$10$deTo3O7BbhvhMjj5iVkBqut62kZCZyghKXTFNl5VDXtb/gabaq2qG')
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
