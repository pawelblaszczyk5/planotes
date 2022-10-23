import { Match, Switch } from 'solid-js';
import { type ColorScheme } from '~/lib/main/utils/colorScheme';

export const ColorSchemeDetector = (props: { colorScheme: ColorScheme }) => (
	<Switch>
		<Match when={props.colorScheme === 'DARK'}>
			<script>document.documentElement.classList.add('dark')</script>
		</Match>
		<Match when={props.colorScheme === 'SYSTEM'}>
			<script>
				if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark');
			</script>
		</Match>
	</Switch>
);
