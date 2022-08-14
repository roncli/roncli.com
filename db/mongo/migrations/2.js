// Create Mastodon collection.
roncli.createCollection("mastodon", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["_id", "lastId"],
            additionalProperties: false,
            properties: {
                _id: {
                    bsonType: "objectId"
                },
                lastId: {
                    bsonType: "string"
                }
            }
        }
    }
});

roncli.mastodon.insertOne({
    "lastId": "108814683853524363"
});
