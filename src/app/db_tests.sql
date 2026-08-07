PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS weapon_profile (
    profile_id INTEGER PRIMARY KEY AUTOINCREMENT,
    weapon TEXT,
    element TEXT
);

CREATE TABLE IF NOT EXISTS skill_rolls (
    roll_num INTEGER,
    profile_id INTEGER REFERENCES weapon_profile(profile_id),
    set_bonus TEXT,
    group_bonus TEXT,
    PRIMARY KEY (roll_num, profile_id)
);

CREATE TABLE IF NOT EXISTS amend_bonus_rolls (
    roll_num INTEGER,
    profile_id INTEGER REFERENCES weapon_profile(profile_id),
    reinforcements TEXT,
    reinforcement_levels TEXT,
    PRIMARY KEY (roll_num, profile_id)
);

CREATE TABLE IF NOT EXISTS keep_bonus_profile (
    keep_id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER REFERENCES weapon_profile(profile_id),
    curr_reinforcements TEXT,
    curr_reinforcement_levels TEXT
);

CREATE TABLE IF NOT EXISTS keep_bonus_roll (
    keep_id INTEGER PRIMARY KEY REFERENCES keep_bonus_weapon(keep_id),
    roll_num INTEGER,
    reinforcement_levels TEXT
);

CREATE TABLE IF NOT EXISTS skill_preferences (
    weapon TEXT,
    element TEXT,
    set_bonus TEXT,
    group_bonus TEXT,
    PRIMARY KEY (weapon, element, set_bonus, group_bonus)
);

CREATE TABLE IF NOT EXISTS bonus_preferences (
    weapon TEXT,
    element TEXT,
    reinforcements TEXT,
    PRIMARY KEY (weapon, element, reinforcements)
);



INSERT INTO weapon_profile(weapon, element) VALUES ('long_sword', 'fire');
INSERT INTO skill_preferences(weapon, element, set_bonus, group_bonus) VALUES ('long_sword', 'fire', 'Gore Magala''s Tyranny', 'Lord''s Soul');

INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (1, 1, 'trash', 'trash');
INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (2, 1, 'trash', 'trash');
INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (3, 1, 'trash', 'trash');
INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (4, 1, 'Gore Magala''s Tyranny', 'Lord''s Fury');
INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (5, 1, 'Gore Magala''s Tyranny', 'Lord''s Soul');
INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (6, 1, 'Gogmapocalypse', 'Lord''s Soul');

INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (2, 10, 'Gogmapocalypse', 'Neopteron Alert');
INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (3, 10, 'Rey Dau''s Voltage', 'Guardian''s Pulse');
INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (4, 10, 'Ebony Odogaron''s Power', 'Flexible Leathercraft');
INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (8, 10, 'Gore Magala''s Tyranny', 'Lord''s Favor');
INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (40, 10, 'Xu Wu''s Vigor', 'Scaling Prowess');


INSERT INTO weapon_profile(weapon, element) VALUES ('long_sword', 'thunder');
INSERT INTO skill_rolls(roll_num, profile_id, set_bonus, group_bonus) VALUES (1, 3, 'Gore Magala''s Tyranny', 'Lord''s Soul');
INSERT INTO skill_preferences(set_bonus, group_bonus) VALUES ('Gore Magala''s Tyranny', 'Lord''s Soul');