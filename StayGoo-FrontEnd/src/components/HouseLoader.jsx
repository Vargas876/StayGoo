import "./HouseLoader.css";

function HouseLoader({ size = 120, label = "Cargando..." }) {
	return (
		<div className="houseLoader" style={{ width: size }} role="status" aria-live="polite">
			<svg viewBox="0 0 180 180" className="houseLoaderSvg" aria-hidden="true">
				<defs>
					<linearGradient id="roofGradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="#f7a07f" />
						<stop offset="100%" stopColor="#e36c4a" />
					</linearGradient>
					<linearGradient id="wallGradient" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stopColor="#ffffff" />
						<stop offset="100%" stopColor="#dfe9f8" />
					</linearGradient>
				</defs>

				<circle className="loaderHalo" cx="90" cy="90" r="76" />

				<g className="houseGroup">
					<path className="roof" d="M90 45 L38 84 H52 L90 57 L128 84 H142 Z" />
					<rect className="houseBody" x="50" y="84" width="80" height="62" rx="8" />
					<rect className="door" x="82" y="105" width="18" height="41" rx="6" />
					<rect className="window windowLeft" x="61" y="98" width="14" height="14" rx="3" />
					<rect className="window windowRight" x="105" y="98" width="14" height="14" rx="3" />
					<path className="ground" d="M44 146 H136" />
					<path className="checkStroke" d="M70 128 L84 141 L112 110" />
				</g>

				<circle className="orbit dot1" cx="36" cy="90" r="4" />
				<circle className="orbit dot2" cx="144" cy="90" r="4" />
				<circle className="orbit dot3" cx="90" cy="36" r="4" />
			</svg>

			<span className="houseLoaderLabel">{label}</span>
		</div>
	);
}

export default HouseLoader;
