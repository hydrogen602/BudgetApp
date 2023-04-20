use std::{
    error::Error,
    fs::{create_dir, create_dir_all},
    ops::{Deref, DerefMut},
    path::Path,
    sync::{Mutex, MutexGuard},
};

use rusqlite::Connection;

pub struct DBState(pub Mutex<Option<Connection>>);
impl Default for DBState {
    fn default() -> Self {
        Self(Mutex::new(None))
    }
}

impl DBState {
    pub fn get_connection(&self, path: &Path) -> Result<LockedConnection, Box<dyn Error>> {
        let mut state = self.0.lock().unwrap();
        if state.is_none() {
            if let Some(parent) = path.parent() {
                create_dir_all(parent)?;
            }
            let conn = Connection::open(path)?;
            conn.set_db_config(
                rusqlite::config::DbConfig::SQLITE_DBCONFIG_ENABLE_FKEY,
                true,
            )?;
            conn.execute(
                "CREATE TABLE IF NOT EXISTS Transactions (
              id INTEGER PRIMARY KEY,
              date TEXT NOT NULL,
              amount INTEGER NOT NULL,
              description TEXT NOT NULL,
              category TEXT NOT NULL
            )",
                (),
            )?;

            *state = Some(conn);
        }

        Ok(LockedConnection::new(state).unwrap())
    }
}

/// A wrapper around a `MutexGuard<Option<Connection>>` that ensures that the connection exists
pub struct LockedConnection<'a> {
    state: MutexGuard<'a, Option<Connection>>,
}

impl<'a> LockedConnection<'a> {
    pub fn new(state: MutexGuard<'a, Option<Connection>>) -> Option<Self> {
        if state.is_some() {
            Some(Self { state })
        } else {
            None
        }
    }
}

impl AsRef<Connection> for LockedConnection<'_> {
    fn as_ref(&self) -> &Connection {
        self.state.as_ref().unwrap()
    }
}

impl AsMut<Connection> for LockedConnection<'_> {
    fn as_mut(&mut self) -> &mut Connection {
        self.state.as_mut().unwrap()
    }
}

impl Deref for LockedConnection<'_> {
    type Target = Connection;

    fn deref(&self) -> &Self::Target {
        self.state.as_ref().unwrap()
    }
}

impl DerefMut for LockedConnection<'_> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        self.state.as_mut().unwrap()
    }
}
