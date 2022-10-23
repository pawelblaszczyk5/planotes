import { createHandler, renderAsync, StartServer } from 'solid-start/entry-server';

const handler = createHandler(renderAsync(event => <StartServer event={event} />));

export default handler;
