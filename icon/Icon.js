/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2020 Extremely Heavy Industries Inc.
 */

import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {library, findIconDefinition, icon} from '@fortawesome/fontawesome-svg-core';
import {elemFactory} from '@xh/hoist/core';
import {withDefault} from '@xh/hoist/utils/js';
import {toLower} from 'lodash';

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
    faArrowsH,
    faArrowsV,
    faArrowToBottom,
    faArrowToLeft,
    faArrowToRight,
    faArrowToTop,
    faArrowUp,
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
    faEnvelope,
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
    faMapMarkerAlt,
    faMapSigns,
    faMask,
    faMinusCircle,
    faMoon,
    faNewspaper,
    faPaperclip,
    faPause,
    faPauseCircle,
    faPlay,
    faPlayCircle,
    faPlusCircle,
    faPrint,
    faQuestion,
    faQuestionCircle,
    faRandom,
    faRedo,
    faRocket,
    faSave,
    faSearch,
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
    faUserCheck,
    faUserCircle,
    faUserClock,
    faUserFriends,
    faUsers,
    faWindow,
    faWrench
} from '@fortawesome/pro-regular-svg-icons';

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
    faArrowsH as faArrowsHLight,
    faArrowsV as faArrowsVLight,
    faArrowToBottom as faArrowToBottomLight,
    faArrowToLeft as faArrowToLeftLight,
    faArrowToRight as faArrowToRightLight,
    faArrowToTop as faArrowToTopLight,
    faArrowUp as faArrowUpLight,
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
    faEnvelope as faEnvelopeLight,
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
    faMapMarkerAlt as faMapMarkerAltLight,
    faMapSigns as faMapSignsLight,
    faMask as faMaskLight,
    faMinusCircle as faMinusCircleLight,
    faMoon as faMoonLight,
    faNewspaper as faNewspaperLight,
    faPaperclip as faPaperclipLight,
    faPause as faPauseLight,
    faPauseCircle as faPauseCircleLight,
    faPlay as faPlayLight,
    faPlayCircle as faPlayCircleLight,
    faPlusCircle as faPlusCircleLight,
    faPrint as faPrintLight,
    faQuestion as faQuestionLight,
    faQuestionCircle as faQuestionCircleLight,
    faRandom as faRandomLight,
    faRedo as faRedoLight,
    faRocket as faRocketLight,
    faSave as faSaveLight,
    faSearch as faSearchLight,
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
    faUserCheck as faUserCheckLight,
    faUserCircle as faUserCircleLight,
    faUserClock as faUserClockLight,
    faUserFriends as faUserFriendsLight,
    faUsers as faUsersLight,
    faWindow as faWindowLight,
    faWrench as faWrenchLight
} from '@fortawesome/pro-light-svg-icons';

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
    faArrowsH as faArrowsHSolid,
    faArrowsV as faArrowsVSolid,
    faArrowToBottom as faArrowToBottomSolid,
    faArrowToLeft as faArrowToLeftSolid,
    faArrowToRight as faArrowToRightSolid,
    faArrowToTop as faArrowToTopSolid,
    faArrowUp as faArrowUpSolid,
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
    faEnvelope as faEnvelopeSolid,
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
    faMapMarkerAlt as faMapMarkerAltSolid,
    faMapSigns as faMapSignsSolid,
    faMask as faMaskSolid,
    faMinusCircle as faMinusCircleSolid,
    faMoon as faMoonSolid,
    faNewspaper as faNewspaperSolid,
    faPaperclip as faPaperclipSolid,
    faPause as faPauseSolid,
    faPauseCircle as faPauseCircleSolid,
    faPlay as faPlaySolid,
    faPlayCircle as faPlayCircleSolid,
    faPlusCircle as faPlusCircleSolid,
    faPrint as faPrintSolid,
    faQuestion as faQuestionSolid,
    faQuestionCircle as faQuestionCircleSolid,
    faRandom as faRandomSolid,
    faRedo as faRedoSolid,
    faRocket as faRocketSolid,
    faSave as faSaveSolid,
    faSearch as faSearchSolid,
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
    faEnvelope, faEnvelopeLight, faEnvelopeSolid,
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
    faMapMarkerAlt, faMapMarkerAltLight, faMapMarkerAltSolid,
    faMapSigns, faMapSignsLight, faMapSignsSolid,
    faMask, faMaskLight, faMaskSolid,
    faMinusCircle, faMinusCircleLight, faMinusCircleSolid,
    faMoon, faMoonLight, faMoonSolid,
    faNewspaper, faNewspaperLight, faNewspaperSolid,
    faPaperclip, faPaperclipLight, faPaperclipSolid,
    faPause, faPauseLight, faPauseSolid,
    faPauseCircle, faPauseCircleLight, faPauseCircleSolid,
    faPlay, faPlayLight, faPlaySolid,
    faPlayCircle, faPlayCircleLight, faPlayCircleSolid,
    faPlusCircle, faPlusCircleLight, faPlusCircleSolid,
    faPrint, faPrintLight, faPrintSolid,
    faQuestion, faQuestionLight, faQuestionSolid,
    faQuestionCircle, faQuestionCircleLight, faQuestionCircleSolid,
    faRandom, faRandomLight, faRandomSolid,
    faRedo, faRedoLight, faRedoSolid,
    faRocket, faRocketLight, faRocketSolid,
    faSave, faSaveLight, faSaveSolid,
    faSearch, faSearchLight, faSearchSolid,
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
    faUserCheck, faUserCheckLight, faUserCheckSolid,
    faUserCircle, faUserCircleLight, faUserCircleSolid,
    faUserClock, faUserClockLight, faUserClockSolid,
    faUserFriends, faUserFriendsLight, faUserFriendsSolid,
    faUsers, faUsersLight, faUsersSolid,
    faWindow, faWindowLight, faWindowSolid,
    faWrench, faWrenchLight, faWrenchSolid
);

/**
 * Singleton class to provide factories for enumerated icons, each returning a FontAwesome SVG element.
 * By default the "regular" variant of each icon is returned. Pass a `prefix` prop of either "fas"
 * for a heavier-weight "solid" variant or "fal" for a "light" variant.
 *
 * Currently importing the licensed "pro" library with additional icons - note this requires fetching
 * the FA npm package via a registry URL w/license token. See https://fontawesome.com/pro#license.
 */
export const Icon = {
    accessDenied(p)     {return fa(p, 'ban')},
    add(p)              {return fa(p, 'plus-circle')},
    addressCard(p)      {return fa(p, 'address-card')},
    analytics(p)        {return fa(p, 'analytics')},
    angleDoubleDown(p)  {return fa(p, 'angle-double-down')},
    angleDoubleLeft(p)  {return fa(p, 'angle-double-left')},
    angleDoubleRight(p) {return fa(p, 'angle-double-right')},
    angleDoubleUp(p)    {return fa(p, 'angle-double-up')},
    angleDown(p)        {return fa(p, 'angle-down')},
    angleLeft(p)        {return fa(p, 'angle-left')},
    angleRight(p)       {return fa(p, 'angle-right')},
    angleUp(p)          {return fa(p, 'angle-up')},
    approve(p)          {return fa(p, 'user-check')},
    arrowDown(p)        {return fa(p, 'arrow-down')},
    arrowLeft(p)        {return fa(p, 'arrow-left')},
    arrowRight(p)       {return fa(p, 'arrow-right')},
    arrowToBottom(p)    {return fa(p, 'arrow-to-bottom')},
    arrowToLeft(p)      {return fa(p, 'arrow-to-left')},
    arrowToRight(p)     {return fa(p, 'arrow-to-right')},
    arrowToTop(p)       {return fa(p, 'arrow-to-top')},
    arrowUp(p)          {return fa(p, 'arrow-up')},
    arrowsLeftRight(p)  {return fa(p, 'arrows-h')},
    arrowsUpDown(p)     {return fa(p, 'arrows-v')},
    attachment(p)       {return fa(p, 'paperclip')},
    balanceScale(p)     {return fa(p, 'balance-scale')},
    balanceScaleLeft(p) {return fa(p, 'balance-scale-left')},
    balanceScaleRight(p) {return fa(p, 'balance-scale-right')},
    bars(p)             {return fa(p, 'bars')},
    bolt(p)             {return fa(p, 'bolt')},
    book(p)             {return fa(p, 'book')},
    bookmark(p)         {return fa(p, 'bookmark')},
    books(p)            {return fa(p, 'books')},
    box(p)              {return fa(p, 'box')},
    boxFull(p)          {return fa(p, 'box-full')},
    bullhorn(p)         {return fa(p, 'bullhorn')},
    calculator(p)       {return fa(p, 'calculator')},
    calendar(p)         {return fa(p, 'calendar-alt')},
    camera(p)           {return fa(p, 'camera')},
    caretLeft(p)        {return fa(p, 'caret-left')},
    caretRight(p)       {return fa(p, 'caret-right')},
    chartArea(p)        {return fa(p, 'chart-area')},
    chartBar(p)         {return fa(p, 'chart-bar')},
    chartLine(p)        {return fa(p, 'chart-line')},
    chartPie(p)         {return fa(p, 'chart-pie')},
    check(p)            {return fa(p, 'check')},
    checkCircle(p)      {return fa(p, 'check-circle')},
    chess(p)            {return fa(p, 'chess')},
    chessKnight(p)      {return fa(p, 'chess-knight-alt')},
    chevronDown(p)      {return fa(p, 'chevron-down')},
    chevronLeft(p)      {return fa(p, 'chevron-left')},
    chevronRight(p)     {return fa(p, 'chevron-right')},
    chevronUp(p)        {return fa(p, 'chevron-up')},
    circle(p)           {return fa(p, 'circle')},
    clipboard(p)        {return fa(p, 'clipboard')},
    clock(p)            {return fa(p, 'clock')},
    close(p)            {return fa(p, 'times')},
    cloudDownload(p)    {return fa(p, 'cloud-download')},
    cloudUpload(p)      {return fa(p, 'cloud-upload')},
    code(p)             {return fa(p, 'code')},
    collapse(p)         {return fa(p, 'compress-alt')},
    comment(p)          {return fa(p, 'comment-dots')},
    contact(p)          {return fa(p, 'address-card')},
    copy(p)             {return fa(p, 'copy')},
    cross(p)            {return fa(p, 'times')},
    crosshairs(p)       {return fa(p, 'crosshairs')},
    cube(p)             {return fa(p, 'cube')},
    database(p)         {return fa(p, 'database')},
    delete(p)           {return fa(p, 'minus-circle')},
    desktop(p)          {return fa(p, 'desktop')},
    detail(p)           {return fa(p, 'search')},
    diff(p)             {return fa(p, 'exchange')},
    disabled(p)         {return fa(p, 'ban')},
    dollarSign(p)       {return fa(p, 'dollar-sign')},
    download(p)         {return fa(p, 'download')},
    edit(p)             {return fa(p, 'edit')},
    envelope(p)         {return fa(p, 'envelope')},
    error(p)            {return fa(p, 'times-hexagon')},
    expand(p)           {return fa(p, 'expand-alt')},
    experiment(p)       {return fa(p, 'flask')},
    eye(p)              {return fa(p, 'eye')},
    eyeSlash(p)         {return fa(p, 'eye-slash')},
    factory(p)          {return fa(p, 'industry-alt')},
    favorite(p)         {return fa(p, 'star')},
    file(p)             {return fa(p, 'file')},
    fileArchive(p)      {return fa(p, 'file-archive')},
    fileCsv(p)          {return fa(p, 'file-csv')},
    fileExcel(p)        {return fa(p, 'file-excel')},
    fileImage(p)        {return fa(p, 'file-image')},
    filePdf(p)          {return fa(p, 'file-pdf')},
    filePowerpoint(p)   {return fa(p, 'file-powerpoint')},
    fileText(p)         {return fa(p, 'file-alt')},
    fileWord(p)         {return fa(p, 'file-word')},
    filter(p)           {return fa(p, 'filter')},
    folder(p)           {return fa(p, 'folder')},
    folderOpen(p)       {return fa(p, 'folder-open')},
    fund(p)             {return fa(p, 'university')},
    gauge(p)            {return fa(p, 'tachometer')},
    gear(p)             {return fa(p, 'cog')},
    gears(p)            {return fa(p, 'cogs')},
    gift(p)             {return fa(p, 'gift')},
    globe(p)            {return fa(p, 'globe')},
    grid(p)             {return fa(p, 'th')},
    gridLarge(p)        {return fa(p, 'th-large')},
    gridPanel(p)        {return fa(p, 'table')},
    grip(p)             {return fa(p, 'grip-horizontal')},
    hand(p)             {return fa(p, 'hand-paper')},
    handshake(p)        {return fa(p, 'handshake')},
    health(p)           {return fa(p, 'stethoscope')},
    history(p)          {return fa(p, 'history')},
    home(p)             {return fa(p, 'home')},
    impersonate(p)      {return fa(p, 'user-friends')},
    inbox(p)            {return fa(p, 'inbox')},
    info(p)             {return fa(p, 'info-circle')},
    institution(p)      {return fa(p, 'university')},
    learn(p)            {return fa(p, 'graduation-cap')},
    link(p)             {return fa(p, 'link')},
    list(p)             {return fa(p, 'align-justify')},
    location(p)         {return fa(p, 'map-marker-alt')},
    lock(p)             {return fa(p, 'lock')},
    login(p)            {return fa(p, 'sign-in')},
    logout(p)           {return fa(p, 'sign-out')},
    mail(p)             {return fa(p, 'envelope')},
    mapSigns(p)         {return fa(p, 'map-signs')},
    mask(p)             {return fa(p, 'mask')},
    moon(p)             {return fa(p, 'moon')},
    news(p)             {return fa(p, 'newspaper')},
    office(p)           {return fa(p, 'building')},
    openExternal(p)     {return fa(p, 'external-link')},
    options(p)          {return fa(p, 'sliders-h-square')},
    pause(p)            {return fa(p, 'pause')},
    pauseCircle(p)      {return fa(p, 'pause-circle')},
    pin(p)              {return fa(p, 'thumbtack')},
    play(p)             {return fa(p, 'play')},
    playCircle(p)       {return fa(p, 'play-circle')},
    portfolio(p)        {return fa(p, 'briefcase')},
    print(p)            {return fa(p, 'print')},
    question(p)         {return fa(p, 'question')},
    questionCircle(p)   {return fa(p, 'question-circle')},
    random(p)           {return fa(p, 'random')},
    redo(p)             {return fa(p, 'redo')},
    refresh(p)          {return fa(p, 'sync')},
    reset(p)            {return fa(p, 'undo')},
    rocket(p)           {return fa(p, 'rocket')},
    save(p)             {return fa(p, 'save')},
    search(p)           {return fa(p, 'search')},
    settings(p)         {return fa(p, 'sliders-h-square')},
    shield(p)           {return fa(p, 'shield-alt')},
    shieldCheck(p)      {return fa(p, 'shield-check')},
    skull(p)            {return fa(p, 'skull')},
    spinner(p)          {return fa(p, 'spinner')},
    stop(p)             {return fa(p, 'stop')},
    stopCircle(p)       {return fa(p, 'stop-circle')},
    stopwatch(p)        {return fa(p, 'stopwatch')},
    sun(p)              {return fa(p, 'sun')},
    sync(p)             {return fa(p, 'sync')},
    tab(p)              {return fa(p, 'folder')},
    table(p)            {return fa(p, 'table')},
    target(p)           {return fa(p, 'bullseye-arrow')},
    thumbsDown(p)       {return fa(p, 'thumbs-down')},
    thumbsUp(p)         {return fa(p, 'thumbs-up')},
    toast(p)            {return fa(p, 'bread-slice')},
    toolbox(p)          {return fa(p, 'toolbox')},
    tools(p)            {return fa(p, 'tools')},
    transaction(p)      {return fa(p, 'exchange')},
    treeList(p)         {return fa(p, 'stream')},
    undo(p)             {return fa(p, 'undo')},
    unlink(p)           {return fa(p, 'unlink')},
    unlock(p)           {return fa(p, 'lock-open')},
    upload(p)           {return fa(p, 'upload')},
    user(p)             {return fa(p, 'user-circle')},
    userClock(p)        {return fa(p, 'user-clock')},
    users(p)            {return fa(p, 'users')},
    warning(p)          {return fa(p, 'exclamation-triangle')},
    warningCircle(p)    {return fa(p, 'exclamation-circle')},
    warningSquare(p)    {return fa(p, 'exclamation-square')},
    window(p)           {return fa(p, 'window')},
    wrench(p)           {return fa(p, 'wrench')},
    x(p)                {return fa(p, 'times')},
    xCircle(p)          {return fa(p, 'times-circle')}
};

export const fontAwesomeIcon = elemFactory(FontAwesomeIcon);

/**
 * Translate an enumerated Icon element into an SVG string for use directly in markup.
 * @param {Element} iconElem
 * @param {Object} [opts]
 * @return {string}
 */
export const convertIconToSvg = function(iconElem, opts) {
    const iconDef = findIconDefinition(serializeIcon(iconElem));
    return icon(iconDef, opts).html[0];
};

export const serializeIcon = function(iconElem) {
    return {
        prefix: iconElem.props.icon[0],
        iconName: iconElem.props.icon[1]
    };
};

export const deserializeIcon = function(iconDef) {
    const {prefix, iconName} = iconDef;
    return fa({prefix}, iconName);
};

/**
 * Return an Icon element for a given file extension, or a generic file icon if null or unmapped.
 * @param {String} extension
 * @return {Element}
 */
export const fileIcon = function(extension) {
    switch (toLower(extension)) {
        case 'png':
        case 'gif':
        case 'jpg':
        case 'jpeg':
            return Icon.fileImage();
        case 'doc':
        case 'docx':
            return Icon.fileWord();
        case 'csv':
            return Icon.fileCsv();
        case 'xls':
        case 'xlsx':
            return Icon.fileExcel();
        case 'ppt':
        case 'pptx':
            return Icon.filePowerpoint();
        case 'msg':
        case 'eml':
            return Icon.mail();
        case 'pdf':
            return Icon.filePdf();
        case 'txt':
            return Icon.fileText();
        case 'zip':
            return Icon.fileArchive();
    }
    return Icon.file();
};

//-----------------------------
// Implementation
//-----------------------------
const fa = function(props = {}, name) {
    const prefix = withDefault(props.prefix, 'far'),
        iconClassNames = classNames('fa-fw', props.className);  // apply fa-fw for consistent icon widths in buttons, etc

    return fontAwesomeIcon({icon: [prefix, name], className: iconClassNames, ...props});
};
