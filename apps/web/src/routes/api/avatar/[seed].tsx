import { Show } from 'solid-js';
import { renderToString } from 'solid-js/web';
import { type APIEvent } from 'solid-start';

// It's all thanks to https://github.com/boringdesigners/boring-avatars

const AVATAR_SIZE = 128;
const VIEWBOX_SIZE = 36;
const COLORS = ['#eab308', '#ec4899', '#8b5cf6', '#84cc16', '#64748b'];

const createHash = (seed: string) =>
	Math.abs(
		Array.from(seed).reduce((hash, currentChar) => {
			const charCode = currentChar.codePointAt(0) ?? 0;
			// eslint-disable-next-line no-bitwise
			const newHash = (hash << 5) - hash + charCode;
			// eslint-disable-next-line no-bitwise
			const intNewHash = newHash & newHash;

			return intNewHash;
		}, 0),
	);

const getDigit = (numberToRetrieveDigit: number, digitPosition: number) => {
	const stringifiedNumber = `${numberToRetrieveDigit}`;
	const position = digitPosition % stringifiedNumber.length;

	return Number(stringifiedNumber[position]);
};

const getBoolean = (numberToRetrieveBoolean: number, digitPosition: number) =>
	Boolean(getDigit(numberToRetrieveBoolean, digitPosition) % 2);

const getUnit = (numberToRetrieveUnit: number, range: number, index?: number) => {
	const value = numberToRetrieveUnit % range;

	return index && getDigit(numberToRetrieveUnit, index) % 2 === 0 ? -value : value;
};

const getContrastingColor = (hexcolor: string) => {
	const hexColorWithoutHex = hexcolor.slice(1);

	const redValue = Number.parseInt(hexColorWithoutHex.slice(0, 2), 16);
	const greenValue = Number.parseInt(hexColorWithoutHex.slice(2, 4), 16);
	const blueValue = Number.parseInt(hexColorWithoutHex.slice(4, 6), 16);

	const yiq = (redValue * 299 + greenValue * 587 + blueValue * 114) / 1_000;

	return yiq >= 128 ? '#000000' : '#FFFFFF';
};

const generateAvatarData = (seed: string) => {
	const hashedSeed = createHash(seed);
	const wrapperColor = COLORS[hashedSeed % COLORS.length]!;
	const preTranslateX = getUnit(hashedSeed, 10, 1);
	const wrapperTranslateX = preTranslateX < 5 ? preTranslateX + AVATAR_SIZE / 9 : preTranslateX;
	const preTranslateY = getUnit(hashedSeed, 10, 2);
	const wrapperTranslateY = preTranslateY < 5 ? preTranslateY + AVATAR_SIZE / 9 : preTranslateY;

	return {
		backgroundColor: COLORS[(hashedSeed + 13) % COLORS.length]!,
		eyeSpread: getUnit(hashedSeed, 5),
		faceColor: getContrastingColor(wrapperColor),
		faceRotate: getUnit(hashedSeed, 10, 3),
		faceTranslateX: wrapperTranslateX > AVATAR_SIZE / 6 ? wrapperTranslateX / 2 : getUnit(hashedSeed, 8, 1),
		faceTranslateY: wrapperTranslateY > AVATAR_SIZE / 6 ? wrapperTranslateY / 2 : getUnit(hashedSeed, 7, 2),
		isCircle: getBoolean(hashedSeed, 1),
		isMouthOpen: getBoolean(hashedSeed, 2),
		mouthSpread: getUnit(hashedSeed, 3),
		wrapperColor,
		wrapperRotate: getUnit(hashedSeed, 360),
		wrapperScale: 1 + getUnit(hashedSeed, AVATAR_SIZE / 12) / 10,
		wrapperTranslateX,
		wrapperTranslateY,
	} as const;
};

const AvatarBeam = (props: ReturnType<typeof generateAvatarData>) => (
	<svg
		viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		width={AVATAR_SIZE}
		height={AVATAR_SIZE}
	>
		<mask id="mask__beam" maskUnits="userSpaceOnUse" x={0} y={0} width={VIEWBOX_SIZE} height={VIEWBOX_SIZE}>
			<rect width={VIEWBOX_SIZE} height={VIEWBOX_SIZE} rx={VIEWBOX_SIZE * 2} fill="#FFFFFF" />
		</mask>
		<g mask="url(#mask__beam)">
			<rect width={VIEWBOX_SIZE} height={VIEWBOX_SIZE} fill={props.backgroundColor} />
			<rect
				x="0"
				y="0"
				width={VIEWBOX_SIZE}
				height={VIEWBOX_SIZE}
				transform={`translate(${props.wrapperTranslateX} ${props.wrapperTranslateY}) rotate(${props.wrapperRotate} ${
					AVATAR_SIZE / 2
				} ${AVATAR_SIZE / 2}) scale(${props.wrapperScale})`}
				fill={props.wrapperColor}
				rx={props.isCircle ? VIEWBOX_SIZE : VIEWBOX_SIZE / 6}
			/>
			<g
				transform={`translate(${props.faceTranslateX} ${props.faceTranslateY}) rotate(${props.faceRotate} ${
					VIEWBOX_SIZE / 2
				} ${VIEWBOX_SIZE / 2})`}
			>
				<Show
					when={props.isMouthOpen}
					fallback={<path d={`M13,${19 + props.mouthSpread} a1,0.75 0 0,0 10,0`} fill={props.faceColor} />}
				>
					<path
						d={'M15 ' + (19 + props.mouthSpread) + 'c2 1 4 1 6 0'}
						stroke={props.faceColor}
						fill="none"
						stroke-linecap="round"
					/>
				</Show>
				<rect x={14 - props.eyeSpread} y={14} width={1.5} height={2} rx={1} stroke="none" fill={props.faceColor} />
				<rect x={20 + props.eyeSpread} y={14} width={1.5} height={2} rx={1} stroke="none" fill={props.faceColor} />
			</g>
		</g>
	</svg>
);

export const GET = ({ params }: APIEvent) => {
	const avatarSvg = renderToString(() => <AvatarBeam {...generateAvatarData(params['seed'] ?? '')} />);

	return new Response(avatarSvg, {
		headers: {
			'Cache-Control': 'public, max-age=604800',
			'Content-Type': 'image/svg+xml',
		},
	});
};
