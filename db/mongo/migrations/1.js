// Create Twitter collection.
roncli.createCollection("twitter", {
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

roncli.twitter.insertOne({
    "lastId": "1536740996154765319"
});
