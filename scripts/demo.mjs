import {getDb,loadEnv} from './lib/db.mjs';
import {migrate} from './migrate.mjs';
import {seed} from './seed.mjs';
import {run,formatRows} from './investigations.mjs';
loadEnv();
if(process.env.DATABASE_URL)throw Error('Demo only runs in a local database. Use a separate local directory.');
const db=await getDb();
try{await migrate(db);await seed(db);for(const c of ['attention','actions-due','custody-review'])console.log(c+'\n'+formatRows(await run(db,c)));}finally{await db.close();}
