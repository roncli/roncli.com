// Get databases.
const admin = db.getSiblingDB("admin");
const roncli = db.getSiblingDB("roncli");

// Set profiling to minimum level.
admin.setProfilingLevel(0);
roncli.setProfilingLevel(0);

// Create web user for access.
admin.createUser({
    user: "web_roncli",
    pwd: WEB_RONCLI_PASSWORD,
    roles: [{
        role: "readWrite",
        db: "roncli"
    }],
    mechanisms: ["SCRAM-SHA-256"]
});

// Create allowed playlist collection.
roncli.createCollection("allowedPlaylist", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "playlistId"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                playlistId: {
                    bsonType: "string"
                }
            }
        }
    }
});

roncli.createCollection("changeAuthorization", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "userId", "type", "authorization", "dateAdded"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                userId: {
                    bsonType: "objectId"
                },
                type: {
                    enum: ["password", "emailChange", "emailValidate", "register"]
                },
                authorization: {
                    bsonType: "object",
                    required: ["salt", "hash"],
                    additionalProperties: false,
                    properties: {
                        salt: {
                            bsonType: "string"
                        },
                        hash: {
                            bsonType: "string"
                        }
                    }
                },
                data: {
                    bsonType: "object",
                    required: [],
                    additionalProperties: true,
                    properties: {}
                },
                dateAdded: {
                    bsonType: "date"
                }
            }
        }
    }
});

roncli.changeAuthorization.createIndex({dateAded: 1}, {expireAfterSeconds: 2 * 60 * 60});

// Create comment collection.
roncli.createCollection("comment", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "url", "comment", "dateAdded", "userId"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                url: {
                    bsonType: "string"
                },
                comment: {
                    bsonType: "string"
                },
                dateAdded: {
                    bsonType: "date"
                },
                userId: {
                    bsonType: "objectId"
                },
                dateModerated: {
                    bsonType: "date"
                }
            }
        }
    }
});

// Create contact collection.
roncli.createCollection("contact", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "title", "value"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                title: {
                    bsonType: "string"
                },
                value: {
                    bsonType: "string"
                }
            }
        }
    }
});

// Create feature collection.
roncli.createCollection("feature", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "url", "section", "order", "dateAdded"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                url: {
                    bsonType: "string"
                },
                title: {
                    bsonType: "string"
                },
                section: {
                    enum: ["music", "coding", "gaming", "life"]
                },
                order: {
                    bsonType: "int"
                },
                dateAdded: {
                    bsonType: "date"
                }
            }
        }
    }
});

// Create page collection.
roncli.createCollection("page", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "url", "title", "shortTitle", "page", "dateAdded", "dateUpdated"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                url: {
                    bsonType: "string"
                },
                parentPageId: {
                    bsonType: "objectId"
                },
                order: {
                    bsonType: "int"
                },
                title: {
                    bsonType: "string"
                },
                shortTitle: {
                    bsonType: "string"
                },
                page: {
                    bsonType: "string"
                },
                dateAdded: {
                    bsonType: "date"
                },
                dateUpdated: {
                    bsonType: "date"
                }
            }
        }
    }
});

// Create project collection.
roncli.createCollection("project", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "title", "url", "projectUrl", "github", "description", "order", "dateAdded", "dateUpdated"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                url: {
                    bsonType: "string"
                },
                title: {
                    bsonType: "string"
                },
                projectUrl: {
                    bsonType: "string"
                },
                github: {
                    bsonType: "object",
                    required: ["user", "repository"],
                    additionalProperties: false,
                    properties: {
                        user: {
                            bsonType: "string"
                        },
                        repository: {
                            bsonType: "string"
                        }
                    }
                },
                description: {
                    bsonType: "string"
                },
                order: {
                    bsonType: "int"
                },
                dateAdded: {
                    bsonType: "date"
                },
                dateUpdated: {
                    bsonType: "date"
                }
            }
        }
    }
});

// Create redirect collection.
roncli.createCollection("redirect", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "fromPath", "toUrl", "dateAdded"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                fromPath: {
                    bsonType: "string"
                },
                toUrl: {
                    bsonType: "string"
                },
                dateAdded: {
                    bsonType: "date"
                }
            }
        }
    }
});

// Create role collection.
roncli.createCollection("role", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "role", "dateAdded"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                role: {
                    bsonType: "string"
                },
                dateAdded: {
                    bsonType: "date"
                }
            }
        }
    }
});

roncli.createCollection("savedLogin", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "userId", "token", "dateAdded"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                userId: {
                    bsonType: "objectId"
                },
                token: {
                    bsonType: "object",
                    required: ["salt", "hash"],
                    additionalProperties: false,
                    properties: {
                        salt: {
                            bsonType: "string"
                        },
                        hash: {
                            bsonType: "string"
                        }
                    }
                },
                dateAdded: {
                    bsonType: "date"
                }
            }
        }
    }
});

roncli.savedLogin.createIndex({dateAded: 1}, {expireAfterSeconds: 30 * 24 * 60 * 60});

// Create user collection.
roncli.createCollection("user", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "email", "dob", "username", "password", "dateAdded", "roles"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                email: {
                    bsonType: "string"
                },
                dob: {
                    bsonType: "date"
                },
                username: {
                    bsonType: "string"
                },
                password: {
                    bsonType: "object",
                    required: ["salt", "hash"],
                    additionalProperties: false,
                    properties: {
                        salt: {
                            bsonType: "string"
                        },
                        hash: {
                            bsonType: "string"
                        }
                    }
                },
                dateValidated: {
                    bsonType: "date",
                },
                dateAdded: {
                    bsonType: "date"
                },
                roles: {
                    bsonType: "array",
                    minItems: 0,
                    uniqueItems: true,
                    additionalProperties: false,
                    items: {
                        bsonType: "objectId"
                    }
                }
            }
        }
    }
});

load(`/var/mongo/init-data.js`);
