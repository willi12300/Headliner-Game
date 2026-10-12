"""Run with python -m unittest discover -s tests -p '*_test.py'."""
from pathlib import Path
from contextlib import closing
import re
import sqlite3
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]


class WorldSaveDatabaseTests(unittest.TestCase):
    def test_migrations_and_save_slots_survive_reopening(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "headliner.sqlite3"
            connection = sqlite3.connect(path)
            connection.execute("PRAGMA foreign_keys = ON")
            for migration in sorted((ROOT / "src-tauri/migrations").glob("*.sql")):
                connection.executescript(migration.read_text(encoding="utf-8"))
            # Exercise the same SQL used by the Rust command.
            source = (ROOT / "src-tauri/src/database.rs").read_text(encoding="utf-8")
            sql = re.search(r'"(INSERT INTO world_saves.*?CURRENT_TIMESTAMP)"', source, re.S).group(1)
            connection.execute(sql, ("manual", '{"world":"original"}'))
            connection.execute(sql, ("autosave", '{"world":"week one"}'))
            connection.execute(sql, ("autosave", '{"world":"week two"}'))
            connection.commit()
            connection.close()
            # Connection's own context manager commits/rolls back but does not close.
            # Windows requires the handle closed before deleting the temporary file.
            with closing(sqlite3.connect(path)) as reopened:
                saves = dict(reopened.execute("SELECT slot, payload FROM world_saves"))
                self.assertEqual(saves["manual"], '{"world":"original"}')
                self.assertEqual(saves["autosave"], '{"world":"week two"}')
                with self.assertRaises(sqlite3.IntegrityError):
                    reopened.execute(sql, ("unknown", "{}"))
                self.assertEqual(dict(reopened.execute("SELECT slot, payload FROM world_saves")), saves)
                self.assertEqual(reopened.execute("PRAGMA integrity_check").fetchone()[0], "ok")


if __name__ == "__main__":
    unittest.main()
