import pino from 'pino';

// This should not be done in a production application.
// You should pipe the JSON log into pino-pretty.
// This application only does it this way since it's a
// small, private project.

const logger = pino({
    prettyPrint: true
});

export default logger;