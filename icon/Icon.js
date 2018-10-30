/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */

import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {library, findIconDefinition, icon} from '@fortawesome/fontawesome-svg-core';
import {elemFactory} from '@xh/hoist/core';
import {withDefault} from '@xh/hoist/utils/js';

import {
    faAddressCard,
    faAlignJustify,
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
    faBan,
    faBars,
    faBolt,
    faBook,
    faBookmark,
    faBooks,
    faBox,
    faBoxFull,
    faBriefcase,
    faBuilding,
    faCalculator,
    faCalendarAlt,
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
    faClipboard,
    faClock,
    faCloudDownload,
    faCloudUpload,
    faCode,
    faCog,
    faCogs,
    faCommentDots,
    faCopy,
    faDatabase,
    faDownload,
    faEdit,
    faEnvelope,
    faExchange,
    faExclamationCircle,
    faExclamationSquare,
    faExclamationTriangle,
    faExternalLink,
    faEye,
    faEyeSlash,
    faFile,
    faFilter,
    faFolder,
    faGift,
    faGlobe,
    faHandPaper,
    faHandshake,
    faHistory,
    faHome,
    faInbox,
    faIndustryAlt,
    faInfoCircle,
    faLock,
    faMapMarkerAlt,
    faMinusCircle,
    faMoon,
    faPaperclip,
    faPause,
    faPauseCircle,
    faPlay,
    faPlayCircle,
    faPlusCircle,
    faPrint,
    faQuestion,
    faQuestionCircle,
    faRocket,
    faSave,
    faSearch,
    faSignIn,
    faSignOut,
    faSkull,
    faStar,
    faStop,
    faStopCircle,
    faStream,
    faSun,
    faSync,
    faTable,
    faTachometer,
    faTh,
    faThLarge,
    faThumbsDown,
    faThumbsUp,
    faTimes,
    faTimesCircle,
    faTimesHexagon,
    faToolbox,
    faUndo,
    faUniversity,
    faUpload,
    faUserCheck,
    faUserCircle,
    faUserClock,
    faUsers,
    faWindow,
    faWrench
} from '@fortawesome/pro-regular-svg-icons';

import {
    faAddressCard as faAddressCardLight,
    faAlignJustify as faAlignJustifyLight,
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
    faBan as faBanLight,
    faBars as faBarsLight,
    faBolt as faBoltLight,
    faBook as faBookLight,
    faBookmark as faBookmarkLight,
    faBooks as faBooksLight,
    faBox as faBoxLight,
    faBoxFull as faBoxFullLight,
    faBriefcase as faBriefcaseLight,
    faBuilding as faBuildingLight,
    faCalculator as faCalculatorLight,
    faCalendarAlt as faCalendarAltLight,
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
    faClipboard as faClipboardLight,
    faClock as faClockLight,
    faCloudDownload as faCloudDownloadLight,
    faCloudUpload as faCloudUploadLight,
    faCode as faCodeLight,
    faCog as faCogLight,
    faCogs as faCogsLight,
    faCommentDots as faCommentDotsLight,
    faCopy as faCopyLight,
    faDatabase as faDatabaseLight,
    faDownload as faDownloadLight,
    faEdit as faEditLight,
    faEnvelope as faEnvelopeLight,
    faExchange as faExchangeLight,
    faExclamationCircle as faExclamationCircleLight,
    faExclamationSquare as faExclamationSquareLight,
    faExclamationTriangle as faExclamationTriangleLight,
    faExternalLink as faExternalLinkLight,
    faEye as faEyeLight,
    faEyeSlash as faEyeSlashLight,
    faFile as faFileLight,
    faFilter as faFilterLight,
    faFolder as faFolderLight,
    faGift as faGiftLight,
    faGlobe as faGlobeLight,
    faHandPaper as faHandPaperLight,
    faHandshake as faHandshakeLight,
    faHistory as faHistoryLight,
    faHome as faHomeLight,
    faInbox as faInboxLight,
    faIndustryAlt as faIndustryAltLight,
    faInfoCircle as faInfoCircleLight,
    faLock as faLockLight,
    faMapMarkerAlt as faMapMarkerAltLight,
    faMinusCircle as faMinusCircleLight,
    faMoon as faMoonLight,
    faPaperclip as faPaperclipLight,
    faPause as faPauseLight,
    faPauseCircle as faPauseCircleLight,
    faPlay as faPlayLight,
    faPlayCircle as faPlayCircleLight,
    faPlusCircle as faPlusCircleLight,
    faPrint as faPrintLight,
    faQuestion as faQuestionLight,
    faQuestionCircle as faQuestionCircleLight,
    faRocket as faRocketLight,
    faSave as faSaveLight,
    faSearch as faSearchLight,
    faSignIn as faSignInLight,
    faSignOut as faSignOutLight,
    faSkull as faSkullLight,
    faStar as faStarLight,
    faStop as faStopLight,
    faStopCircle as faStopCircleLight,
    faStream as faStreamLight,
    faSun as faSunLight,
    faSync as faSyncLight,
    faTable as faTableLight,
    faTachometer as faTachometerLight,
    faTh as faThLight,
    faThLarge as faThLargeLight,
    faThumbsDown as faThumbsDownLight,
    faThumbsUp as faThumbsUpLight,
    faTimes as faTimesLight,
    faTimesCircle as faTimesCircleLight,
    faTimesHexagon as faTimesHexagonLight,
    faToolbox as faToolboxLight,
    faUndo as faUndoLight,
    faUniversity as faUniversityLight,
    faUpload as faUploadLight,
    faUserCheck as faUserCheckLight,
    faUserCircle as faUserCircleLight,
    faUserClock as faUserClockLight,
    faUsers as faUsersLight,
    faWindow as faWindowLight,
    faWrench as faWrenchLight
} from '@fortawesome/pro-light-svg-icons';

import {
    faAddressCard as faAddressCardSolid,
    faAlignJustify as faAlignJustifySolid,
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
    faBan as faBanSolid,
    faBars as faBarsSolid,
    faBolt as faBoltSolid,
    faBook as faBookSolid,
    faBookmark as faBookmarkSolid,
    faBooks as faBooksSolid,
    faBox as faBoxSolid,
    faBoxFull as faBoxFullSolid,
    faBriefcase as faBriefcaseSolid,
    faBuilding as faBuildingSolid,
    faCalculator as faCalculatorSolid,
    faCalendarAlt as faCalendarAltSolid,
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
    faClipboard as faClipboardSolid,
    faClock as faClockSolid,
    faCloudDownload as faCloudDownloadSolid,
    faCloudUpload as faCloudUploadSolid,
    faCode as faCodeSolid,
    faCog as faCogSolid,
    faCogs as faCogsSolid,
    faCommentDots as faCommentDotsSolid,
    faCopy as faCopySolid,
    faDatabase as faDatabaseSolid,
    faDownload as faDownloadSolid,
    faEdit as faEditSolid,
    faEnvelope as faEnvelopeSolid,
    faExchange as faExchangeSolid,
    faExclamationCircle as faExclamationCircleSolid,
    faExclamationSquare as faExclamationSquareSolid,
    faExclamationTriangle as faExclamationTriangleSolid,
    faExternalLink as faExternalLinkSolid,
    faEye as faEyeSolid,
    faEyeSlash as faEyeSlashSolid,
    faFile as faFileSolid,
    faFilter as faFilterSolid,
    faFolder as faFolderSolid,
    faGift as faGiftSolid,
    faGlobe as faGlobeSolid,
    faHandPaper as faHandPaperSolid,
    faHandshake as faHandshakeSolid,
    faHistory as faHistorySolid,
    faHome as faHomeSolid,
    faInbox as faInboxSolid,
    faIndustryAlt as faIndustryAltSolid,
    faInfoCircle as faInfoCircleSolid,
    faLock as faLockSolid,
    faMapMarkerAlt as faMapMarkerAltSolid,
    faMinusCircle as faMinusCircleSolid,
    faMoon as faMoonSolid,
    faPaperclip as faPaperclipSolid,
    faPause as faPauseSolid,
    faPauseCircle as faPauseCircleSolid,
    faPlay as faPlaySolid,
    faPlayCircle as faPlayCircleSolid,
    faPlusCircle as faPlusCircleSolid,
    faPrint as faPrintSolid,
    faQuestion as faQuestionSolid,
    faQuestionCircle as faQuestionCircleSolid,
    faRocket as faRocketSolid,
    faSave as faSaveSolid,
    faSearch as faSearchSolid,
    faSignIn as faSignInSolid,
    faSignOut as faSignOutSolid,
    faSkull as faSkullSolid,
    faStar as faStarSolid,
    faStop as faStopSolid,
    faStopCircle as faStopCircleSolid,
    faStream as faStreamSolid,
    faSun as faSunSolid,
    faSync as faSyncSolid,
    faTable as faTableSolid,
    faTachometer as faTachometerSolid,
    faTh as faThSolid,
    faThLarge as faThLargeSolid,
    faThumbsDown as faThumbsDownSolid,
    faThumbsUp as faThumbsUpSolid,
    faTimes as faTimesSolid,
    faTimesCircle as faTimesCircleSolid,
    faTimesHexagon as faTimesHexagonSolid,
    faToolbox as faToolboxSolid,
    faUndo as faUndoSolid,
    faUniversity as faUniversitySolid,
    faUpload as faUploadSolid,
    faUserCheck as faUserCheckSolid,
    faUserCircle as faUserCircleSolid,
    faUserClock as faUserClockSolid,
    faUsers as faUsersSolid,
    faWindow as faWindowSolid,
    faWrench as faWrenchSolid
} from '@fortawesome/pro-solid-svg-icons';

// Register imported icons with the FA library to ensure they are available by name.
library.add(
    faAddressCard, faAddressCardLight, faAddressCardSolid,
    faAddressCard, faAddressCardLight, faAddressCardSolid,
    faAlignJustify, faAlignJustifyLight, faAlignJustifySolid,
    faAngleDown, faAngleDownLight, faAngleDownSolid,
    faAngleLeft, faAngleLeftLight, faAngleLeftSolid,
    faAngleRight, faAngleRightLight, faAngleRightSolid,
    faAngleUp, faAngleUpLight, faAngleUpSolid,
    faArrowDown, faArrowDownLight, faArrowDownSolid,
    faArrowLeft, faArrowLeftLight, faArrowLeftSolid,
    faArrowRight, faArrowRightLight, faArrowRightSolid,
    faArrowToBottom, faArrowToBottomLight, faArrowToBottomSolid,
    faArrowToLeft, faArrowToLeftLight, faArrowToLeftSolid,
    faArrowToRight, faArrowToRightLight, faArrowToRightSolid,
    faArrowToTop, faArrowToTopLight, faArrowToTopSolid,
    faArrowUp, faArrowUpLight, faArrowUpSolid,
    faArrowsH, faArrowsHLight, faArrowsHSolid,
    faArrowsV, faArrowsVLight, faArrowsVSolid,
    faBalanceScale, faBalanceScaleLight, faBalanceScaleSolid,
    faBan, faBanLight, faBanSolid,
    faBars, faBarsLight, faBarsSolid,
    faBolt, faBoltLight, faBoltSolid,
    faBook, faBookLight, faBookSolid,
    faBookmark, faBookmarkLight, faBookmarkSolid,
    faBooks, faBooksLight, faBooksSolid,
    faBox, faBoxLight, faBoxSolid,
    faBoxFull, faBoxFullLight, faBoxFullSolid,
    faBriefcase, faBriefcaseLight, faBriefcaseSolid,
    faBuilding, faBuildingLight, faBuildingSolid,
    faCalculator, faCalculatorLight, faCalculatorSolid,
    faCalendarAlt, faCalendarAltLight, faCalendarAltSolid,
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
    faClipboard, faClipboardLight, faClipboardSolid,
    faClock, faClockLight, faClockSolid,
    faCloudDownload, faCloudDownloadLight, faCloudDownloadSolid,
    faCloudUpload, faCloudUploadLight, faCloudUploadSolid,
    faCode, faCodeLight, faCodeSolid,
    faCog, faCogLight, faCogSolid,
    faCogs, faCogsLight, faCogsSolid,
    faCommentDots, faCommentDotsLight, faCommentDotsSolid,
    faCopy, faCopyLight, faCopySolid,
    faDatabase, faDatabaseLight, faDatabaseSolid,
    faDownload, faDownloadLight, faDownloadSolid,
    faEdit, faEditLight, faEditSolid,
    faEnvelope, faEnvelopeLight, faEnvelopeSolid,
    faExchange, faExchangeLight, faExchangeSolid,
    faExclamationCircle, faExclamationCircleLight, faExclamationCircleSolid,
    faExclamationSquare, faExclamationSquareLight, faExclamationSquareSolid,
    faExclamationTriangle, faExclamationTriangleLight, faExclamationTriangleSolid,
    faExternalLink, faExternalLinkLight, faExternalLinkSolid,
    faEye, faEyeLight, faEyeSolid,
    faEyeSlash, faEyeSlashLight, faEyeSlashSolid,
    faFile, faFileLight, faFileSolid,
    faFilter, faFilterLight, faFilterSolid,
    faFolder, faFolderLight, faFolderSolid,
    faGift, faGiftLight, faGiftSolid,
    faGlobe, faGlobeLight, faGlobeSolid,
    faHandPaper, faHandPaperLight, faHandPaperSolid,
    faHandshake, faHandshakeLight, faHandshakeSolid,
    faHistory, faHistoryLight, faHistorySolid,
    faHome, faHomeLight, faHomeSolid,
    faInbox, faInboxLight, faInboxSolid,
    faIndustryAlt, faIndustryAltLight, faIndustryAltSolid,
    faInfoCircle, faInfoCircleLight, faInfoCircleSolid,
    faLock, faLockLight, faLockSolid,
    faMapMarkerAlt, faMapMarkerAltLight, faMapMarkerAltSolid,
    faMinusCircle, faMinusCircleLight, faMinusCircleSolid,
    faMoon, faMoonLight, faMoonSolid,
    faPaperclip, faPaperclipLight, faPaperclipSolid,
    faPause, faPauseLight, faPauseSolid,
    faPauseCircle, faPauseCircleLight, faPauseCircleSolid,
    faPlay, faPlayLight, faPlaySolid,
    faPlayCircle, faPlayCircleLight, faPlayCircleSolid,
    faPlusCircle, faPlusCircleLight, faPlusCircleSolid,
    faPrint, faPrintLight, faPrintSolid,
    faQuestion, faQuestionLight, faQuestionSolid,
    faQuestionCircle, faQuestionCircleLight, faQuestionCircleSolid,
    faRocket, faRocketLight, faRocketSolid,
    faSave, faSaveLight, faSaveSolid,
    faSearch, faSearchLight, faSearchSolid,
    faSignIn, faSignInLight, faSignInSolid,
    faSignOut, faSignOutLight, faSignOutSolid,
    faSkull, faSkullLight, faSkullSolid,
    faStar, faStarLight, faStarSolid,
    faStop, faStopLight, faStopSolid,
    faStopCircle, faStopCircleLight, faStopCircleSolid,
    faStream, faStreamLight, faStreamSolid,
    faSun, faSunLight, faSunSolid,
    faSync, faSyncLight, faSyncSolid,
    faTable, faTableLight, faTableSolid,
    faTachometer, faTachometerLight, faTachometerSolid,
    faTh, faThLight, faThSolid,
    faThLarge, faThLargeLight, faThLargeSolid,
    faThumbsDown, faThumbsDownLight, faThumbsDownSolid,
    faThumbsUp, faThumbsUpLight, faThumbsUpSolid,
    faTimes, faTimesLight, faTimesSolid,
    faTimesCircle, faTimesCircleLight, faTimesCircleSolid,
    faTimesHexagon, faTimesHexagonLight, faTimesHexagonSolid,
    faToolbox, faToolboxLight, faToolboxSolid,
    faUndo, faUndoLight, faUndoSolid,
    faUniversity, faUniversityLight, faUniversitySolid,
    faUpload, faUploadLight, faUploadSolid,
    faUserCheck, faUserCheckLight, faUserCheckSolid,
    faUserCircle, faUserCircleLight, faUserCircleSolid,
    faUserClock, faUserClockLight, faUserClockSolid,
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
    bars(p)             {return fa(p, 'bars')},
    bolt(p)             {return fa(p, 'bolt')},
    book(p)             {return fa(p, 'book')},
    bookmark(p)         {return fa(p, 'bookmark')},
    books(p)            {return fa(p, 'books')},
    box(p)              {return fa(p, 'box')},
    boxFull(p)          {return fa(p, 'box-full')},
    calculator(p)       {return fa(p, 'calculator')},
    calendar(p)         {return fa(p, 'calendar-alt')},
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
    clipboard(p)        {return fa(p, 'clipboard')},
    clock(p)            {return fa(p, 'clock')},
    close(p)            {return fa(p, 'times')},
    cloudDownload(p)    {return fa(p, 'cloud-download')},
    cloudUpload(p)      {return fa(p, 'cloud-upload')},
    code(p)             {return fa(p, 'code')},
    comment(p)          {return fa(p, 'comment-dots')},
    contact(p)          {return fa(p, 'address-card')},
    copy(p)             {return fa(p, 'copy')},
    cross(p)            {return fa(p, 'times')},
    database(p)         {return fa(p, 'database')},
    delete(p)           {return fa(p, 'minus-circle')},
    diff(p)             {return fa(p, 'exchange')},
    disabled(p)         {return fa(p, 'ban')},
    download(p)         {return fa(p, 'download')},
    edit(p)             {return fa(p, 'edit')},
    envelope(p)         {return fa(p, 'envelope')},
    error(p)            {return fa(p, 'times-hexagon')},
    eye(p)              {return fa(p, 'eye')},
    eyeSlash(p)         {return fa(p, 'eye-slash')},
    factory(p)          {return fa(p, 'industry-alt')},
    favorite(p)         {return fa(p, 'star')},
    file(p)             {return fa(p, 'file')},
    filter(p)           {return fa(p, 'filter')},
    folder(p)           {return fa(p, 'folder')},
    fund(p)             {return fa(p, 'university')},
    gauge(p)            {return fa(p, 'tachometer')},
    gear(p)             {return fa(p, 'cog')},
    gears(p)            {return fa(p, 'cogs')},
    gift(p)             {return fa(p, 'gift')},
    globe(p)            {return fa(p, 'globe')},
    grid(p)             {return fa(p, 'th')},
    gridLarge(p)        {return fa(p, 'th-large')},
    gridPanel(p)        {return fa(p, 'table')},
    hand(p)             {return fa(p, 'hand-paper')},
    handshake(p)        {return fa(p, 'handshake')},
    history(p)          {return fa(p, 'history')},
    home(p)             {return fa(p, 'home')},
    inbox(p)            {return fa(p, 'inbox')},
    info(p)             {return fa(p, 'info-circle')},
    institution(p)      {return fa(p, 'university')},
    list(p)             {return fa(p, 'align-justify')},
    location(p)         {return fa(p, 'map-marker-alt')},
    lock(p)             {return fa(p, 'lock')},
    login(p)            {return fa(p, 'sign-in')},
    logout(p)           {return fa(p, 'sign-out')},
    mail(p)             {return fa(p, 'envelope')},
    moon(p)             {return fa(p, 'moon')},
    office(p)           {return fa(p, 'building')},
    openExternal(p)     {return fa(p, 'external-link')},
    pause(p)            {return fa(p, 'pause')},
    pauseCircle(p)      {return fa(p, 'pause-circle')},
    play(p)             {return fa(p, 'play')},
    playCircle(p)       {return fa(p, 'play-circle')},
    portfolio(p)        {return fa(p, 'briefcase')},
    print(p)            {return fa(p, 'print')},
    question(p)         {return fa(p, 'question')},
    questionCircle(p)   {return fa(p, 'question-circle')},
    refresh(p)          {return fa(p, 'sync')},
    reset(p)            {return fa(p, 'undo')},
    rocket(p)           {return fa(p, 'rocket')},
    save(p)             {return fa(p, 'save')},
    search(p)           {return fa(p, 'search')},
    skull(p)            {return fa(p, 'skull')},
    stop(p)             {return fa(p, 'stop')},
    stopCircle(p)       {return fa(p, 'stop-circle')},
    sun(p)              {return fa(p, 'sun')},
    sync(p)             {return fa(p, 'sync')},
    tab(p)              {return fa(p, 'folder')},
    table(p)            {return fa(p, 'table')},
    thumbsDown(p)       {return fa(p, 'thumbs-down')},
    thumbsUp(p)         {return fa(p, 'thumbs-up')},
    toolbox(p)          {return fa(p, 'toolbox')},
    treeList(p)         {return fa(p, 'stream')},
    undo(p)             {return fa(p, 'undo')},
    upload(p)           {return fa(p, 'upload')},
    user(p)             {return fa(p, 'user-circle')},
    users(p)            {return fa(p, 'users')},
    userClock(p)        {return fa(p, 'user-clock')},
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
    const iconDef = findIconDefinition({
        prefix: iconElem.props.icon[0],
        iconName: iconElem.props.icon[1]
    });
    return icon(iconDef, opts).html[0];
};

//-----------------------------
// Implementation
//-----------------------------
const fa = function(props = {}, name) {
    const prefix = withDefault(props.prefix, 'far'),
        iconClassNames = classNames('fa-fw', props.className);  // apply fa-fw for consistent icon widths in buttons, etc

    return fontAwesomeIcon({icon: [prefix, name], className: iconClassNames, ...props});
};
