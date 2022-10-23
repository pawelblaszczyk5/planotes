//  @refresh reload
import { type Component } from 'solid-js';
import { render } from 'solid-js/web';
import { Button } from '~/lib/Button/Button';

import '@unocss/reset/tailwind.css';
import 'uno.css';

const App: Component = () => {
	return <Button />;
};

render(() => <App />, document.querySelector('#root') as HTMLElement);
