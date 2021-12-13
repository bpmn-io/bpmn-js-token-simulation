import LogSVG from './log.svg';
import AngleRightSVG from './angle-right.svg';
import CheckCircleSVG from './check-circle.svg';
import ForkSVG from './fork.svg';
import ExclamationTriangleSVG from './exclamation-triangle.svg';
import InfoSVG from './info.svg';
import PauseSVG from './pause.svg';
import RemovePauseSVG from './pause-remove.svg';
import PlaySVG from './play.svg';
import ResetSVG from './reset.svg';
import TachometerSVG from './tachometer-alt.svg';
import TimesCircleSVG from './times-circle.svg';
import TimesSVG from './times.svg';
import ToggleOffSVG from './toggle-off.svg';
import ToggleOnSVG from './toggle-on.svg';


function createIcon(svg) {
  return function Icon(className = '') {
    return `<span class="bts-icon ${ className }">${svg}</span>`;
  };
}

export const LogIcon = createIcon(LogSVG);
export const AngleRightIcon = createIcon(AngleRightSVG);
export const CheckCircleIcon = createIcon(CheckCircleSVG);
export const RemovePauseIcon = createIcon(RemovePauseSVG);
export const ForkIcon = createIcon(ForkSVG);
export const ExclamationTriangleIcon = createIcon(ExclamationTriangleSVG);
export const InfoIcon = createIcon(InfoSVG);
export const PauseIcon = createIcon(PauseSVG);
export const PlayIcon = createIcon(PlaySVG);
export const ResetIcon = createIcon(ResetSVG);
export const TachometerIcon = createIcon(TachometerSVG);
export const TimesCircleIcon = createIcon(TimesCircleSVG);
export const TimesIcon = createIcon(TimesSVG);
export const ToggleOffIcon = createIcon(ToggleOffSVG);
export const ToggleOnIcon = createIcon(ToggleOnSVG);
