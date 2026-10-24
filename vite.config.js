import {defineConfig} from 'vite';
import {submissionsHandler} from './server/submissions.js';
export default defineConfig({plugins:[{name:'private-community-submissions',configureServer(server){server.middlewares.use(submissionsHandler)}}]});
