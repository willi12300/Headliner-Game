INSERT OR IGNORE INTO genres(id, name, parent_id, trend) VALUES
('genre_indie','Indie',NULL,55),('genre_rock','Rock',NULL,52),('genre_electronic','Electronic',NULL,58),
('genre_folk','Folk',NULL,42),('genre_hiphop','Hip Hop',NULL,60),('genre_psych','Psychedelic',NULL,44),
('genre_punk','Punk',NULL,43),('genre_pop','Pop',NULL,68),('genre_dnb','Drum & Bass',NULL,54),
('genre_soul','Soul',NULL,46),('genre_experimental','Experimental',NULL,35);

INSERT OR IGNORE INTO member_roles(id, name) VALUES
('role_vocalist','Lead Vocalist'),('role_guitarist','Guitarist'),('role_bassist','Bassist'),
('role_drummer','Drummer'),('role_keyboard','Keyboardist'),('role_dj','DJ'),
('role_producer','Producer'),('role_rapper','Rapper'),('role_multi','Multi-Instrumentalist');

INSERT OR IGNORE INTO staff_roles(id, name) VALUES
('staff_booking','Booking Manager'),('staff_scout','Scout'),('staff_marketing','Marketing Director'),
('staff_operations','Operations Manager'),('staff_site','Site Manager'),('staff_security','Security Chief'),
('staff_artist','Artist Liaison'),('staff_sponsor','Sponsorship Manager'),('staff_finance','Finance Director'),
('staff_production','Production Manager');

INSERT OR IGNORE INTO traits(id, name, entity_type, polarity, description) VALUES
('trait_band_live','Always Delivers Live','band','positive','Performs close to its ceiling at major live shows.'),
('trait_band_cult','Cult Following','band','positive','Maintains unusually loyal fans even during decline.'),
('trait_band_fast','Fast-Growing Fanbase','band','positive','Receives a follower-growth multiplier during positive momentum.'),
('trait_band_conflict','Creative Differences','band','negative','Internal conflict risk rises when morale or chemistry falls.'),
('trait_band_late','Frequently Late','band','negative','Punctuality incidents and promoter distrust are more likely.'),
('trait_member_leader','Natural Leader','member','positive','Improves conflict resolution and group morale.'),
('trait_member_genius','Creative Genius','member','positive','Can produce exceptional songwriting development.'),
('trait_member_lifestyle','Poor Lifestyle','member','negative','Health and reliability incidents are more likely.'),
('trait_member_injury','Injury Prone','member','negative','Physical or vocal health incidents are more frequent.'),
('trait_festival_discovery','Wonderband Specialists','festival','positive','Improves emerging-artist scouting and reputation growth.'),
('trait_festival_artist','Artist Friendly','festival','positive','Artist and label relationship gains are stronger.'),
('trait_festival_chaos','Poor Organisation','festival','negative','Operational failures are more likely under pressure.');
