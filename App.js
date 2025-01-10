const { MongoClient, ServerApiVersion } = require('mongodb');
async function main(){
    
    // const uri = "mongodb+srv://shevarepushkar:QJTgoN39Z4ynzvJL@cluster0.7g6ee.mongodb.net/";
    const uri = "mongodb+srv://amanwisdomsprout:amanwisdomsprout@cluster0.iparkic.mongodb.net/";

    const client = new MongoClient(uri);

    try {

        await client.connect();

        await listDatabases(client);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);