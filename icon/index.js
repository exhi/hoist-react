/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */
export * from './Icon';
export * from './XHLogo';

import {library} from '@fortawesome/fontawesome-svg-core';
import {
    faAddressCard as faAddressCardLight,
    faAlignJustify as faAlignJustifyLight,
    faAnalytics as faAnalyticsLight,
    faAngleDoubleDown as faAngleDoubleDownLight,
    faAngleDoubleLeft as faAngleDoubleLeftLight,
    faAngleDoubleRight as faAngleDoubleRightLight,
    faAngleDoubleUp as faAngleDoubleUpLight,
    faAngleDown as faAngleDownLight,
    faAngleLeft as faAngleLeftLight,
    faAngleRight as faAngleRightLight,
    faAngleUp as faAngleUpLight,
    faArrowDown as faArrowDownLight,
    faArrowLeft as faArrowLeftLight,
    faArrowRight as faArrowRightLight,
    faArrowToBottom as faArrowToBottomLight,
    faArrowToLeft as faArrowToLeftLight,
    faArrowToRight as faArrowToRightLight,
    faArrowToTop as faArrowToTopLight,
    faArrowUp as faArrowUpLight,
    faArrowsH as faArrowsHLight,
    faArrowsV as faArrowsVLight,
    faBalanceScale as faBalanceScaleLight,
    faBalanceScaleLeft as faBalanceScaleLeftLight,
    faBalanceScaleRight as faBalanceScaleRightLight,
    faBan as faBanLight,
    faBars as faBarsLight,
    faBolt as faBoltLight,
    faBook as faBookLight,
    faBookmark as faBookmarkLight,
    faBooks as faBooksLight,
    faBox as faBoxLight,
    faBoxFull as faBoxFullLight,
    faBracketsCurly as faBracketsCurlyLight,
    faBreadSlice as faBreadSliceLight,
    faBriefcase as faBriefcaseLight,
    faBuilding as faBuildingLight,
    faBullhorn as faBullhornLight,
    faBullseyeArrow as faBullseyeArrowLight,
    faCalculator as faCalculatorLight,
    faCalendarAlt as faCalendarAltLight,
    faCamera as faCameraLight,
    faCaretLeft as faCaretLeftLight,
    faCaretRight as faCaretRightLight,
    faChartArea as faChartAreaLight,
    faChartBar as faChartBarLight,
    faChartLine as faChartLineLight,
    faChartPie as faChartPieLight,
    faCheck as faCheckLight,
    faCheckCircle as faCheckCircleLight,
    faChess as faChessLight,
    faChessKnightAlt as faChessKnightAltLight,
    faChevronDown as faChevronDownLight,
    faChevronLeft as faChevronLeftLight,
    faChevronRight as faChevronRightLight,
    faChevronUp as faChevronUpLight,
    faCircle as faCircleLight,
    faClipboard as faClipboardLight,
    faClock as faClockLight,
    faCloudDownload as faCloudDownloadLight,
    faCloudUpload as faCloudUploadLight,
    faCode as faCodeLight,
    faCog as faCogLight,
    faCogs as faCogsLight,
    faCommentDots as faCommentDotsLight,
    faCompressAlt as faCompressAltLight,
    faCopy as faCopyLight,
    faCrosshairs as faCrosshairsLight,
    faCube as faCubeLight,
    faDatabase as faDatabaseLight,
    faDesktop as faDesktopLight,
    faDollarSign as faDollarSignLight,
    faDownload as faDownloadLight,
    faEdit as faEditLight,
    faEllipsisH as faEllipsisHLight,
    faEllipsisV as faEllipsisVLight,
    faEnvelope as faEnvelopeLight,
    faEquals as faEqualsLight,
    faEuroSign as faEuroSignLight,
    faExchange as faExchangeLight,
    faExclamationCircle as faExclamationCircleLight,
    faExclamationSquare as faExclamationSquareLight,
    faExclamationTriangle as faExclamationTriangleLight,
    faExpandAlt as faExpandAltLight,
    faExternalLink as faExternalLinkLight,
    faEye as faEyeLight,
    faEyeSlash as faEyeSlashLight,
    faFile as faFileLight,
    faFileAlt as faFileAltLight,
    faFileArchive as faFileArchiveLight,
    faFileCsv as faFileCsvLight,
    faFileExcel as faFileExcelLight,
    faFileImage as faFileImageLight,
    faFilePdf as faFilePdfLight,
    faFilePowerpoint as faFilePowerpointLight,
    faFileWord as faFileWordLight,
    faFilter as faFilterLight,
    faFlag as faFlagLight,
    faFlask as faFlaskLight,
    faFolder as faFolderLight,
    faFolderOpen as faFolderOpenLight,
    faGift as faGiftLight,
    faGlobe as faGlobeLight,
    faGraduationCap as faGraduationCapLight,
    faGripHorizontal as faGripHorizontalLight,
    faHandPaper as faHandPaperLight,
    faHandshake as faHandshakeLight,
    faHistory as faHistoryLight,
    faHome as faHomeLight,
    faInbox as faInboxLight,
    faIndustryAlt as faIndustryAltLight,
    faInfoCircle as faInfoCircleLight,
    faLink as faLinkLight,
    faLock as faLockLight,
    faLockOpen as faLockOpenLight,
    faMagic as faMagicLight,
    faMapMarkerAlt as faMapMarkerAltLight,
    faMapSigns as faMapSignsLight,
    faMask as faMaskLight,
    faMinusCircle as faMinusCircleLight,
    faMoon as faMoonLight,
    faNewspaper as faNewspaperLight,
    faPaperclip as faPaperclipLight,
    faPaste as faPasteLight,
    faPause as faPauseLight,
    faPauseCircle as faPauseCircleLight,
    faPlay as faPlayLight,
    faPlayCircle as faPlayCircleLight,
    faPlus as faPlusLight,
    faPlusCircle as faPlusCircleLight,
    faPoundSign as faPoundSignLight,
    faPrint as faPrintLight,
    faQuestion as faQuestionLight,
    faQuestionCircle as faQuestionCircleLight,
    faRandom as faRandomLight,
    faRedo as faRedoLight,
    faRocket as faRocketLight,
    faSave as faSaveLight,
    faSearch as faSearchLight,
    faServer as faServerLight,
    faShieldAlt as faShieldAltLight,
    faShieldCheck as faShieldCheckLight,
    faSignIn as faSignInLight,
    faSignOut as faSignOutLight,
    faSkull as faSkullLight,
    faSlidersHSquare as faSlidersHSquareLight,
    faSpinner as faSpinnerLight,
    faStar as faStarLight,
    faStethoscope as faStethoscopeLight,
    faStop as faStopLight,
    faStopCircle as faStopCircleLight,
    faStopwatch as faStopwatchLight,
    faStream as faStreamLight,
    faSun as faSunLight,
    faSync as faSyncLight,
    faTable as faTableLight,
    faTachometer as faTachometerLight,
    faTh as faThLight,
    faThLarge as faThLargeLight,
    faThumbsDown as faThumbsDownLight,
    faThumbsUp as faThumbsUpLight,
    faThumbtack as faThumbtackLight,
    faTimes as faTimesLight,
    faTimesCircle as faTimesCircleLight,
    faTimesHexagon as faTimesHexagonLight,
    faToolbox as faToolboxLight,
    faTools as faToolsLight,
    faUndo as faUndoLight,
    faUniversity as faUniversityLight,
    faUnlink as faUnlinkLight,
    faUpload as faUploadLight,
    faUsdCircle as faUsdCircleLight,
    faUserCheck as faUserCheckLight,
    faUserCircle as faUserCircleLight,
    faUserClock as faUserClockLight,
    faUserFriends as faUserFriendsLight,
    faUsers as faUsersLight,
    faWindow as faWindowLight,
    faWrench as faWrenchLight
} from '@fortawesome/pro-light-svg-icons';
import {
    faAddressCard,
    faAlignJustify,
    faAnalytics,
    faAngleDoubleDown,
    faAngleDoubleLeft,
    faAngleDoubleRight,
    faAngleDoubleUp,
    faAngleDown,
    faAngleLeft,
    faAngleRight,
    faAngleUp,
    faArrowDown,
    faArrowLeft,
    faArrowRight,
    faArrowToBottom,
    faArrowToLeft,
    faArrowToRight,
    faArrowToTop,
    faArrowUp,
    faArrowsH,
    faArrowsV,
    faBalanceScale,
    faBalanceScaleLeft,
    faBalanceScaleRight,
    faBan,
    faBars,
    faBolt,
    faBook,
    faBookmark,
    faBooks,
    faBox,
    faBoxFull,
    faBracketsCurly,
    faBreadSlice,
    faBriefcase,
    faBuilding,
    faBullhorn,
    faBullseyeArrow,
    faCalculator,
    faCalendarAlt,
    faCamera,
    faCaretLeft,
    faCaretRight,
    faChartArea,
    faChartBar,
    faChartLine,
    faChartPie,
    faCheck,
    faCheckCircle,
    faChess,
    faChessKnightAlt,
    faChevronDown,
    faChevronLeft,
    faChevronRight,
    faChevronUp,
    faCircle,
    faClipboard,
    faClock,
    faCloudDownload,
    faCloudUpload,
    faCode,
    faCog,
    faCogs,
    faCommentDots,
    faCompressAlt,
    faCopy,
    faCrosshairs,
    faCube,
    faDatabase,
    faDesktop,
    faDollarSign,
    faDownload,
    faEdit,
    faEllipsisH,
    faEllipsisV,
    faEnvelope,
    faEquals,
    faEuroSign,
    faExchange,
    faExclamationCircle,
    faExclamationSquare,
    faExclamationTriangle,
    faExpandAlt,
    faExternalLink,
    faEye,
    faEyeSlash,
    faFile,
    faFileAlt,
    faFileArchive,
    faFileCsv,
    faFileExcel,
    faFileImage,
    faFilePdf,
    faFilePowerpoint,
    faFileWord,
    faFilter,
    faFlag,
    faFlask,
    faFolder,
    faFolderOpen,
    faGift,
    faGlobe,
    faGraduationCap,
    faGripHorizontal,
    faHandPaper,
    faHandshake,
    faHistory,
    faHome,
    faInbox,
    faIndustryAlt,
    faInfoCircle,
    faLink,
    faLock,
    faLockOpen,
    faMagic,
    faMapMarkerAlt,
    faMapSigns,
    faMask,
    faMinusCircle,
    faMoon,
    faNewspaper,
    faPaperclip,
    faPaste,
    faPause,
    faPauseCircle,
    faPlay,
    faPlayCircle,
    faPlus,
    faPlusCircle,
    faPoundSign,
    faPrint,
    faQuestion,
    faQuestionCircle,
    faRandom,
    faRedo,
    faRocket,
    faSave,
    faSearch,
    faServer,
    faShieldAlt,
    faShieldCheck,
    faSignIn,
    faSignOut,
    faSkull,
    faSlidersHSquare,
    faSpinner,
    faStar,
    faStethoscope,
    faStop,
    faStopCircle,
    faStopwatch,
    faStream,
    faSun,
    faSync,
    faTable,
    faTachometer,
    faTh,
    faThLarge,
    faThumbsDown,
    faThumbsUp,
    faThumbtack,
    faTimes,
    faTimesCircle,
    faTimesHexagon,
    faToolbox,
    faTools,
    faUndo,
    faUniversity,
    faUnlink,
    faUpload,
    faUsdCircle,
    faUserCheck,
    faUserCircle,
    faUserClock,
    faUserFriends,
    faUsers,
    faWindow,
    faWrench
} from '@fortawesome/pro-regular-svg-icons';
import {
    faAddressCard as faAddressCardSolid,
    faAlignJustify as faAlignJustifySolid,
    faAnalytics as faAnalyticsSolid,
    faAngleDoubleDown as faAngleDoubleDownSolid,
    faAngleDoubleLeft as faAngleDoubleLeftSolid,
    faAngleDoubleRight as faAngleDoubleRightSolid,
    faAngleDoubleUp as faAngleDoubleUpSolid,
    faAngleDown as faAngleDownSolid,
    faAngleLeft as faAngleLeftSolid,
    faAngleRight as faAngleRightSolid,
    faAngleUp as faAngleUpSolid,
    faArrowDown as faArrowDownSolid,
    faArrowLeft as faArrowLeftSolid,
    faArrowRight as faArrowRightSolid,
    faArrowToBottom as faArrowToBottomSolid,
    faArrowToLeft as faArrowToLeftSolid,
    faArrowToRight as faArrowToRightSolid,
    faArrowToTop as faArrowToTopSolid,
    faArrowUp as faArrowUpSolid,
    faArrowsH as faArrowsHSolid,
    faArrowsV as faArrowsVSolid,
    faBalanceScale as faBalanceScaleSolid,
    faBalanceScaleLeft as faBalanceScaleLeftSolid,
    faBalanceScaleRight as faBalanceScaleRightSolid,
    faBan as faBanSolid,
    faBars as faBarsSolid,
    faBolt as faBoltSolid,
    faBook as faBookSolid,
    faBookmark as faBookmarkSolid,
    faBooks as faBooksSolid,
    faBox as faBoxSolid,
    faBoxFull as faBoxFullSolid,
    faBracketsCurly as faBracketsCurlySolid,
    faBreadSlice as faBreadSliceSolid,
    faBriefcase as faBriefcaseSolid,
    faBuilding as faBuildingSolid,
    faBullhorn as faBullhornSolid,
    faBullseyeArrow as faBullseyeArrowSolid,
    faCalculator as faCalculatorSolid,
    faCalendarAlt as faCalendarAltSolid,
    faCamera as faCameraSolid,
    faCaretLeft as faCaretLeftSolid,
    faCaretRight as faCaretRightSolid,
    faChartArea as faChartAreaSolid,
    faChartBar as faChartBarSolid,
    faChartLine as faChartLineSolid,
    faChartPie as faChartPieSolid,
    faCheck as faCheckSolid,
    faCheckCircle as faCheckCircleSolid,
    faChess as faChessSolid,
    faChessKnightAlt as faChessKnightAltSolid,
    faChevronDown as faChevronDownSolid,
    faChevronLeft as faChevronLeftSolid,
    faChevronRight as faChevronRightSolid,
    faChevronUp as faChevronUpSolid,
    faCircle as faCircleSolid,
    faClipboard as faClipboardSolid,
    faClock as faClockSolid,
    faCloudDownload as faCloudDownloadSolid,
    faCloudUpload as faCloudUploadSolid,
    faCode as faCodeSolid,
    faCog as faCogSolid,
    faCogs as faCogsSolid,
    faCommentDots as faCommentDotsSolid,
    faCompressAlt as faCompressAltSolid,
    faCopy as faCopySolid,
    faCrosshairs as faCrosshairsSolid,
    faCube as faCubeSolid,
    faDatabase as faDatabaseSolid,
    faDesktop as faDesktopSolid,
    faDollarSign as faDollarSignSolid,
    faDownload as faDownloadSolid,
    faEdit as faEditSolid,
    faEllipsisH as faEllipsisHSolid,
    faEllipsisV as faEllipsisVSolid,
    faEnvelope as faEnvelopeSolid,
    faEquals as faEqualsSolid,
    faEuroSign as faEuroSignSolid,
    faExchange as faExchangeSolid,
    faExclamationCircle as faExclamationCircleSolid,
    faExclamationSquare as faExclamationSquareSolid,
    faExclamationTriangle as faExclamationTriangleSolid,
    faExpandAlt as faExpandAltSolid,
    faExternalLink as faExternalLinkSolid,
    faEye as faEyeSolid,
    faEyeSlash as faEyeSlashSolid,
    faFile as faFileSolid,
    faFileAlt as faFileAltSolid,
    faFileArchive as faFileArchiveSolid,
    faFileCsv as faFileCsvSolid,
    faFileExcel as faFileExcelSolid,
    faFileImage as faFileImageSolid,
    faFilePdf as faFilePdfSolid,
    faFilePowerpoint as faFilePowerpointSolid,
    faFileWord as faFileWordSolid,
    faFilter as faFilterSolid,
    faFlag as faFlagSolid,
    faFlask as faFlaskSolid,
    faFolder as faFolderSolid,
    faFolderOpen as faFolderOpenSolid,
    faGift as faGiftSolid,
    faGlobe as faGlobeSolid,
    faGraduationCap as faGraduationCapSolid,
    faGripHorizontal as faGripHorizontalSolid,
    faHandPaper as faHandPaperSolid,
    faHandshake as faHandshakeSolid,
    faHistory as faHistorySolid,
    faHome as faHomeSolid,
    faInbox as faInboxSolid,
    faIndustryAlt as faIndustryAltSolid,
    faInfoCircle as faInfoCircleSolid,
    faLink as faLinkSolid,
    faLock as faLockSolid,
    faLockOpen as faLockOpenSolid,
    faMagic as faMagicSolid,
    faMapMarkerAlt as faMapMarkerAltSolid,
    faMapSigns as faMapSignsSolid,
    faMask as faMaskSolid,
    faMinusCircle as faMinusCircleSolid,
    faMoon as faMoonSolid,
    faNewspaper as faNewspaperSolid,
    faPaperclip as faPaperclipSolid,
    faPaste as faPasteSolid,
    faPause as faPauseSolid,
    faPauseCircle as faPauseCircleSolid,
    faPlay as faPlaySolid,
    faPlayCircle as faPlayCircleSolid,
    faPlus as faPlusSolid,
    faPlusCircle as faPlusCircleSolid,
    faPoundSign as faPoundSignSolid,
    faPrint as faPrintSolid,
    faQuestion as faQuestionSolid,
    faQuestionCircle as faQuestionCircleSolid,
    faRandom as faRandomSolid,
    faRedo as faRedoSolid,
    faRocket as faRocketSolid,
    faSave as faSaveSolid,
    faSearch as faSearchSolid,
    faServer as faServerSolid,
    faShieldAlt as faShieldAltSolid,
    faShieldCheck as faShieldCheckSolid,
    faSignIn as faSignInSolid,
    faSignOut as faSignOutSolid,
    faSkull as faSkullSolid,
    faSlidersHSquare as faSlidersHSquareSolid,
    faSpinner as faSpinnerSolid,
    faStar as faStarSolid,
    faStethoscope as faStethoscopeSolid,
    faStop as faStopSolid,
    faStopCircle as faStopCircleSolid,
    faStopwatch as faStopwatchSolid,
    faStream as faStreamSolid,
    faSun as faSunSolid,
    faSync as faSyncSolid,
    faTable as faTableSolid,
    faTachometer as faTachometerSolid,
    faTh as faThSolid,
    faThLarge as faThLargeSolid,
    faThumbsDown as faThumbsDownSolid,
    faThumbsUp as faThumbsUpSolid,
    faThumbtack as faThumbtackSolid,
    faTimes as faTimesSolid,
    faTimesCircle as faTimesCircleSolid,
    faTimesHexagon as faTimesHexagonSolid,
    faToolbox as faToolboxSolid,
    faTools as faToolsSolid,
    faUndo as faUndoSolid,
    faUniversity as faUniversitySolid,
    faUnlink as faUnlinkSolid,
    faUpload as faUploadSolid,
    faUsdCircle as faUsdCircleSolid,
    faUserCheck as faUserCheckSolid,
    faUserCircle as faUserCircleSolid,
    faUserClock as faUserClockSolid,
    faUserFriends as faUserFriendsSolid,
    faUsers as faUsersSolid,
    faWindow as faWindowSolid,
    faWrench as faWrenchSolid
} from '@fortawesome/pro-solid-svg-icons';

// Register imported icons with the FA library to ensure they are available by name.
library.add(
    faAddressCard, faAddressCardLight, faAddressCardSolid,
    faAddressCard, faAddressCardLight, faAddressCardSolid,
    faAlignJustify, faAlignJustifyLight, faAlignJustifySolid,
    faAnalytics, faAnalyticsLight, faAnalyticsSolid,
    faAngleDoubleDown, faAngleDoubleDownLight, faAngleDoubleDownSolid,
    faAngleDoubleLeft, faAngleDoubleLeftLight, faAngleDoubleLeftSolid,
    faAngleDoubleRight, faAngleDoubleRightLight, faAngleDoubleRightSolid,
    faAngleDoubleUp, faAngleDoubleUpLight, faAngleDoubleUpSolid,
    faAngleDown, faAngleDownLight, faAngleDownSolid,
    faAngleLeft, faAngleLeftLight, faAngleLeftSolid,
    faAngleRight, faAngleRightLight, faAngleRightSolid,
    faAngleUp, faAngleUpLight, faAngleUpSolid,
    faArrowDown, faArrowDownLight, faArrowDownSolid,
    faArrowLeft, faArrowLeftLight, faArrowLeftSolid,
    faArrowRight, faArrowRightLight, faArrowRightSolid,
    faArrowsH, faArrowsHLight, faArrowsHSolid,
    faArrowsV, faArrowsVLight, faArrowsVSolid,
    faArrowToBottom, faArrowToBottomLight, faArrowToBottomSolid,
    faArrowToLeft, faArrowToLeftLight, faArrowToLeftSolid,
    faArrowToRight, faArrowToRightLight, faArrowToRightSolid,
    faArrowToTop, faArrowToTopLight, faArrowToTopSolid,
    faArrowUp, faArrowUpLight, faArrowUpSolid,
    faBalanceScale, faBalanceScaleLight, faBalanceScaleSolid,
    faBalanceScaleLeft, faBalanceScaleLeftLight, faBalanceScaleLeftSolid,
    faBalanceScaleRight, faBalanceScaleRightLight, faBalanceScaleRightSolid,
    faBan, faBanLight, faBanSolid,
    faBars, faBarsLight, faBarsSolid,
    faBolt, faBoltLight, faBoltSolid,
    faBook, faBookLight, faBookSolid,
    faBookmark, faBookmarkLight, faBookmarkSolid,
    faBooks, faBooksLight, faBooksSolid,
    faBox, faBoxLight, faBoxSolid,
    faBoxFull, faBoxFullLight, faBoxFullSolid,
    faBracketsCurly, faBracketsCurlyLight, faBracketsCurlySolid,
    faBreadSlice, faBreadSliceLight, faBreadSliceSolid,
    faBriefcase, faBriefcaseLight, faBriefcaseSolid,
    faBuilding, faBuildingLight, faBuildingSolid,
    faBullhorn, faBullhornLight, faBullhornSolid,
    faBullseyeArrow, faBullseyeArrowLight, faBullseyeArrowSolid,
    faCalculator, faCalculatorLight, faCalculatorSolid,
    faCalendarAlt, faCalendarAltLight, faCalendarAltSolid,
    faCamera, faCameraLight, faCameraSolid,
    faCaretLeft, faCaretLeftLight, faCaretLeftSolid,
    faCaretRight, faCaretRightLight, faCaretRightSolid,
    faChartArea, faChartAreaLight, faChartAreaSolid,
    faChartBar, faChartBarLight, faChartBarSolid,
    faChartLine, faChartLineLight, faChartLineSolid,
    faChartPie, faChartPieLight, faChartPieSolid,
    faCheck, faCheckLight, faCheckSolid,
    faCheckCircle, faCheckCircleLight, faCheckCircleSolid,
    faChess, faChessLight, faChessSolid,
    faChessKnightAlt, faChessKnightAltLight, faChessKnightAltSolid,
    faChevronDown, faChevronDownLight, faChevronDownSolid,
    faChevronLeft, faChevronLeftLight, faChevronLeftSolid,
    faChevronRight, faChevronRightLight, faChevronRightSolid,
    faChevronUp, faChevronUpLight, faChevronUpSolid,
    faCircle, faCircleLight, faCircleSolid,
    faClipboard, faClipboardLight, faClipboardSolid,
    faClock, faClockLight, faClockSolid,
    faCloudDownload, faCloudDownloadLight, faCloudDownloadSolid,
    faCloudUpload, faCloudUploadLight, faCloudUploadSolid,
    faCode, faCodeLight, faCodeSolid,
    faCog, faCogLight, faCogSolid,
    faCogs, faCogsLight, faCogsSolid,
    faCommentDots, faCommentDotsLight, faCommentDotsSolid,
    faCompressAlt, faCompressAltLight, faCompressAltSolid,
    faCopy, faCopyLight, faCopySolid,
    faCrosshairs, faCrosshairsLight, faCrosshairsSolid,
    faCube, faCubeLight, faCubeSolid,
    faDatabase, faDatabaseLight, faDatabaseSolid,
    faDesktop, faDesktopLight, faDesktopSolid,
    faDollarSign, faDollarSignLight, faDollarSignSolid,
    faDownload, faDownloadLight, faDownloadSolid,
    faEdit, faEditLight, faEditSolid,
    faEllipsisH, faEllipsisHLight, faEllipsisHSolid,
    faEllipsisV, faEllipsisVLight, faEllipsisVSolid,
    faEnvelope, faEnvelopeLight, faEnvelopeSolid,
    faEquals, faEqualsLight, faEqualsSolid,
    faEuroSign, faEuroSignLight, faEuroSignSolid,
    faExchange, faExchangeLight, faExchangeSolid,
    faExclamationCircle, faExclamationCircleLight, faExclamationCircleSolid,
    faExclamationSquare, faExclamationSquareLight, faExclamationSquareSolid,
    faExclamationTriangle, faExclamationTriangleLight, faExclamationTriangleSolid,
    faExpandAlt, faExpandAltLight, faExpandAltSolid,
    faExternalLink, faExternalLinkLight, faExternalLinkSolid,
    faEye, faEyeLight, faEyeSolid,
    faEyeSlash, faEyeSlashLight, faEyeSlashSolid,
    faFile, faFileLight, faFileSolid,
    faFileAlt, faFileAltLight, faFileAltSolid,
    faFileArchive, faFileArchiveLight, faFileArchiveSolid,
    faFileCsv, faFileCsvLight, faFileCsvSolid,
    faFileExcel, faFileExcelLight, faFileExcelSolid,
    faFileImage, faFileImageLight, faFileImageSolid,
    faFilePdf, faFilePdfLight, faFilePdfSolid,
    faFilePowerpoint, faFilePowerpointLight, faFilePowerpointSolid,
    faFileWord, faFileWordLight, faFileWordSolid,
    faFilter, faFilterLight, faFilterSolid,
    faFlag, faFlagLight, faFlagSolid,
    faFlask, faFlaskLight, faFlaskSolid,
    faFolder, faFolderLight, faFolderSolid,
    faFolderOpen, faFolderOpenLight, faFolderOpenSolid,
    faGift, faGiftLight, faGiftSolid,
    faGlobe, faGlobeLight, faGlobeSolid,
    faGraduationCap, faGraduationCapLight, faGraduationCapSolid,
    faGripHorizontal, faGripHorizontalLight, faGripHorizontalSolid,
    faHandPaper, faHandPaperLight, faHandPaperSolid,
    faHandshake, faHandshakeLight, faHandshakeSolid,
    faHistory, faHistoryLight, faHistorySolid,
    faHome, faHomeLight, faHomeSolid,
    faInbox, faInboxLight, faInboxSolid,
    faIndustryAlt, faIndustryAltLight, faIndustryAltSolid,
    faInfoCircle, faInfoCircleLight, faInfoCircleSolid,
    faLink, faLinkLight, faLinkSolid,
    faLock, faLockLight, faLockSolid,
    faLockOpen, faLockOpenLight, faLockOpenSolid,
    faMagic, faMagicLight, faMagicSolid,
    faMapMarkerAlt, faMapMarkerAltLight, faMapMarkerAltSolid,
    faMapSigns, faMapSignsLight, faMapSignsSolid,
    faMask, faMaskLight, faMaskSolid,
    faMinusCircle, faMinusCircleLight, faMinusCircleSolid,
    faMoon, faMoonLight, faMoonSolid,
    faNewspaper, faNewspaperLight, faNewspaperSolid,
    faPaperclip, faPaperclipLight, faPaperclipSolid,
    faPaste, faPasteLight, faPasteSolid,
    faPause, faPauseLight, faPauseSolid,
    faPauseCircle, faPauseCircleLight, faPauseCircleSolid,
    faPlay, faPlayLight, faPlaySolid,
    faPlayCircle, faPlayCircleLight, faPlayCircleSolid,
    faPlus, faPlusLight, faPlusSolid,
    faPlusCircle, faPlusCircleLight, faPlusCircleSolid,
    faPoundSign, faPoundSignLight, faPoundSignSolid,
    faPrint, faPrintLight, faPrintSolid,
    faQuestion, faQuestionLight, faQuestionSolid,
    faQuestionCircle, faQuestionCircleLight, faQuestionCircleSolid,
    faRandom, faRandomLight, faRandomSolid,
    faRedo, faRedoLight, faRedoSolid,
    faRocket, faRocketLight, faRocketSolid,
    faSave, faSaveLight, faSaveSolid,
    faSearch, faSearchLight, faSearchSolid,
    faServer, faServerLight, faServerSolid,
    faShieldAlt, faShieldAltLight, faShieldAltSolid,
    faShieldCheck, faShieldCheckLight, faShieldCheckSolid,
    faSignIn, faSignInLight, faSignInSolid,
    faSignOut, faSignOutLight, faSignOutSolid,
    faSkull, faSkullLight, faSkullSolid,
    faSlidersHSquare, faSlidersHSquareLight, faSlidersHSquareSolid,
    faSpinner, faSpinnerLight, faSpinnerSolid,
    faStar, faStarLight, faStarSolid,
    faStethoscope, faStethoscopeLight, faStethoscopeSolid,
    faStop, faStopLight, faStopSolid,
    faStopCircle, faStopCircleLight, faStopCircleSolid,
    faStopwatch, faStopwatchLight, faStopwatchSolid,
    faStream, faStreamLight, faStreamSolid,
    faSun, faSunLight, faSunSolid,
    faSync, faSyncLight, faSyncSolid,
    faTable, faTableLight, faTableSolid,
    faTachometer, faTachometerLight, faTachometerSolid,
    faTh, faThLight, faThSolid,
    faThLarge, faThLargeLight, faThLargeSolid,
    faThumbsDown, faThumbsDownLight, faThumbsDownSolid,
    faThumbsUp, faThumbsUpLight, faThumbsUpSolid,
    faThumbtack, faThumbtackLight, faThumbtackSolid,
    faTimes, faTimesLight, faTimesSolid,
    faTimesCircle, faTimesCircleLight, faTimesCircleSolid,
    faTimesHexagon, faTimesHexagonLight, faTimesHexagonSolid,
    faToolbox, faToolboxLight, faToolboxSolid,
    faTools, faToolsLight, faToolsSolid,
    faUndo, faUndoLight, faUndoSolid,
    faUniversity, faUniversityLight, faUniversitySolid,
    faUnlink, faUnlinkLight, faUnlinkSolid,
    faUpload, faUploadLight, faUploadSolid,
    faUsdCircle, faUsdCircleLight, faUsdCircleSolid,
    faUserCheck, faUserCheckLight, faUserCheckSolid,
    faUserCircle, faUserCircleLight, faUserCircleSolid,
    faUserClock, faUserClockLight, faUserClockSolid,
    faUserFriends, faUserFriendsLight, faUserFriendsSolid,
    faUsers, faUsersLight, faUsersSolid,
    faWindow, faWindowLight, faWindowSolid,
    faWrench, faWrenchLight, faWrenchSolid
);
