import * as SQLite from "expo-sqlite"
import UtilityStorageManager from "./UtilityStorageManager";

class DBManager {
    static #databaseInstance = null

    constructor() {
        this.db = SQLite.openDatabase("Twit-tok-db"); //usa per fixare il db quando si rompe
        UtilityStorageManager.DBIsInit().then(val => {
            this.db = SQLite.openDatabase("Twit-tok-db");
            if (!val) {
                UtilityStorageManager.getProfileUid().then(uid => {
                    const profile_table = "CREATE TABLE IF NOT EXISTS Profile(uid INTEGER PRIMARY KEY, name TEXT, picture BLOB(100000) CHECK(LENGTH(picture) <= 100000), pversion SMALLINT, FOREIGN KEY(uid) REFERENCES Followed_users(followed));";
                    const pictures = "CREATE TABLE IF NOT EXISTS Pictures(uid INTEGER PRIMARY KEY, picture BLOB(100000) CHECK(LENGTH(picture) <= 100000) NOT NULL, pversion SMALLINT NOT NULL);";
                    const profile_trigger = "CREATE TRIGGER unique_profile BEFORE INSERT ON Profile FOR EACH ROW BEGIN SELECT RAISE(ABORT, \"User already exists\") FROM Profile WHERE uid <> " + uid + "; END;";
                    const insert_profile = "INSERT INTO Profile(uid, name, picture, pversion) VALUES (" + uid + ", \"\", \"\", 0);";

                    this.db.transaction(t => {
                        t.executeSql(pictures, [], () => {}, (tx, err) => {console.log("2 => " + err)});
                        t.executeSql(profile_table, [], () => {}, (tx, err) => {console.log("3 => " + err)});
                        t.executeSql(profile_trigger, [], () => {}, (tx, err) => {console.log("4 => " + err)});
                        t.executeSql(insert_profile, [], () => {}, (tx, err) => {console.log("7 => " + err)});
                    });
                })
            }
        })
    }

    static getInstance() { // get DB instance (singleton)
        if (this.#databaseInstance === null) {
            this.#databaseInstance = new DBManager();

        }
        return this.#databaseInstance
    }

    clearDB() {
        const delete_profile_table = "DROP TABLE Profile;";
        const delete_pictures_table = "DROP TABLE Pictures;";
        this.db.transaction(t => {
            t.executeSql(delete_profile_table, [], (tx, resultSet) => {
                console.log("Profile table dropped.");
            }, (tx, error) => {
                // TODO: Verificare se opportuno gestire l'errore in modo differente
                console.log("1 " + error.message);
            });
            t.executeSql(delete_pictures_table, [], (tx, resultSet) => {
                console.log("Picures table dropped.");
            }, (tx, error) => {
                // TODO: Verificare se opportuno gestire l'errore in modo differente
                console.log("2 " + error.message);
            });
        });
    }

    getProfileFromDB(onResult, onError) {
        const query = "SELECT * FROM Profile";
        this.db.transaction((transaction) => {
            transaction.executeSql(query, [], (transaction, resultSet) => {
                onResult(resultSet.rows._array[0])
            })
        }, error => onError(error))
    }

    updateProfilePicture(picture, onResut, onError) {
        const query = "UPDATE Profile SET picture = ?, pversion = pversion + 1 WHERE uid = ?;";
        UtilityStorageManager.getProfileUid().then((uid) => {
            if (typeof(picture) === "string") {
                this.db.transaction(tx => {
                    tx.executeSql(query, [picture, uid], () => {
                        onResut()
                        console.log("Profile picture changed.");
                    }, (tx, error) => {
                        console.log(error.message);
                    });
                });
            } else {
                onError()
            }
        });
    }

    updateProfileName(name, onResult, onError) {
        const query = "UPDATE Profile SET name = ? WHERE uid = ?;";
        UtilityStorageManager.getProfileUid().then((uid) => {
            if (typeof(name) === "string") {
                this.db.transaction(tx => {
                    tx.executeSql(query, [name, uid], () => {
                        onResult()
                        console.log("Profile name changed.");
                    }, (tx, error) => {
                        console.log(error.message);
                    });
                });
            } else {
                onError()
            }
        });
    }





    updateUserPicture(picture, pversion) {
        const query = "UPDATE Pictures SET picture = ?, pversion = ? WHERE uid = ?;";
        UtilityStorageManager.getProfileUid().then((uid) => {
            if (typeof(picture) === "string" && typeof(pversion) === "number") {
                this.db.transaction(tx => {
                    tx.executeSql(query, [picture, pversion, uid], () => {
                        console.log("Profile pic changed.");
                    }, (tx, error) => {
                        console.log(error.message);
                    });
                });
            } else {
                // TODO: Gestisci errore
                throw new Error("picture must be a string");
            }
        });
    }

    addUserPicture(uid, picture, pversion) {
        const query = "INSERT INTO Pictures(uid, picture, pversion) VALUES (?, ?, ?)";
        if (typeof(picture) === "string" && typeof(uid) === "number" && typeof(pversion) === "number") {
            this.db.transaction(tx => {
                tx.executeSql(query, [uid, picture, pversion], () => {
                    console.log("Inserimento riuscito");
                }, (tx, error) => {
                    // TODO: Verificare se opportuno gestire l'errore in modo differente
                    console.log(error.message);
                });
            });
        } else {
            throw new Error("picture must be a string");
        }
    }

    getUserPicture(uid, onResult) {
        const query = "SELECT picture, pversion FROM Pictures WHERE uid = ?;";
        if (typeof(uid) === "number") {
            this.db.transaction(tx => {
                tx.executeSql(query, [uid], (transaction, resultSet) => {
                    onResult(resultSet.rows._array)
                }, (tx, error) => {
                    // TODO: Verificare se opportuno gestire l'errore in modo differente
                    console.log(error.message);
                });
            });
        } else {
            throw new Error("picture must be a string");
        }
    }

}

export default function database() {
    return DBManager.getInstance();
}