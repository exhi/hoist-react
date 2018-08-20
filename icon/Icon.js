/*
 * This file belongs to Hoist, an application development toolkit
 * developed by Extremely Heavy Industries (www.xh.io | info@xh.io)
 *
 * Copyright © 2018 Extremely Heavy Industries Inc.
 */
import {elemFactory} from '@xh/hoist/core';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {library, findIconDefinition, icon} from '@fortawesome/fontawesome-svg-core';

import {
    faAddressCard,
    faAlignJustify,
    faAngleLeft,
    faAngleRight,
    faArrowDown,
    faArrowToLeft,
    faArrowToRight,
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
    faExclamationTriangle,
    faExternalLink,
    faEye,
    faEyeSlash,
    faFilter,
    faFolder,
    faGift,
    faGlobe,
    faHandPaper,
    faHome,
    faIndustryAlt,
    faInfoCircle,
    faLock,
    faMinusCircle,
    faMoon,
    faPause,
    faPlay,
    faPlusCircle,
    faPrint,
    faRocket,
    faSave,
    faSearch,
    faSignIn,
    faSignOut,
    faSkull,
    faSun,
    faSync,
    faTable,
    faTachometer,
    faThumbsDown,
    faThumbsUp,
    faTimes,
    faTimesCircle,
    faTimesHexagon,
    faToolbox,
    faUndo,
    faUpload,
    faUserCheck,
    faUserCircle,
    faUsers,
    faWrench
} from '@fortawesome/pro-regular-svg-icons';

import {
    faAddressCard as faAddressCardLight,
    faAlignJustify as faAlignJustifyLight,
    faAngleLeft as faAngleLeftLight,
    faAngleRight as faAngleRightLight,
    faArrowDown as faArrowDownLight,
    faArrowToLeft as faArrowToLeftLight,
    faArrowToRight as faArrowToRightLight,
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
    faExclamationTriangle as faExclamationTriangleLight,
    faExternalLink as faExternalLinkLight,
    faEye as faEyeLight,
    faEyeSlash as faEyeSlashLight,
    faFilter as faFilterLight,
    faFolder as faFolderLight,
    faGift as faGiftLight,
    faGlobe as faGlobeLight,
    faHandPaper as faHandPaperLight,
    faHome as faHomeLight,
    faIndustryAlt as faIndustryAltLight,
    faInfoCircle as faInfoCircleLight,
    faLock as faLockLight,
    faMinusCircle as faMinusCircleLight,
    faMoon as faMoonLight,
    faPause as faPauseLight,
    faPlay as faPlayLight,
    faPlusCircle as faPlusCircleLight,
    faPrint as faPrintLight,
    faRocket as faRocketLight,
    faSave as faSaveLight,
    faSearch as faSearchLight,
    faSignIn as faSignInLight,
    faSignOut as faSignOutLight,
    faSkull as faSkullLight,
    faSun as faSunLight,
    faSync as faSyncLight,
    faTable as faTableLight,
    faTachometer as faTachometerLight,
    faThumbsDown as faThumbsDownLight,
    faThumbsUp as faThumbsUpLight,
    faTimes as faTimesLight,
    faTimesCircle as faTimesCircleLight,
    faTimesHexagon as faTimesHexagonLight,
    faToolbox as faToolboxLight,
    faUndo as faUndoLight,
    faUpload as faUploadLight,
    faUserCheck as faUserCheckLight,
    faUserCircle as faUserCircleLight,
    faUsers as faUsersLight,
    faWrench as faWrenchLight
} from '@fortawesome/pro-light-svg-icons';

import {
    faAddressCard as faAddressCardSolid,
    faAlignJustify as faAlignJustifySolid,
    faAngleLeft as faAngleLeftSolid,
    faAngleRight as faAngleRightSolid,
    faArrowDown as faArrowDownSolid,
    faArrowToLeft as faArrowToLeftSolid,
    faArrowToRight as faArrowToRightSolid,
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
    faExclamationTriangle as faExclamationTriangleSolid,
    faExternalLink as faExternalLinkSolid,
    faEye as faEyeSolid,
    faEyeSlash as faEyeSlashSolid,
    faFilter as faFilterSolid,
    faFolder as faFolderSolid,
    faGift as faGiftSolid,
    faGlobe as faGlobeSolid,
    faHandPaper as faHandPaperSolid,
    faHome as faHomeSolid,
    faIndustryAlt as faIndustryAltSolid,
    faInfoCircle as faInfoCircleSolid,
    faLock as faLockSolid,
    faMinusCircle as faMinusCircleSolid,
    faMoon as faMoonSolid,
    faPause as faPauseSolid,
    faPlay as faPlaySolid,
    faPlusCircle as faPlusCircleSolid,
    faPrint as faPrintSolid,
    faRocket as faRocketSolid,
    faSave as faSaveSolid,
    faSearch as faSearchSolid,
    faSignIn as faSignInSolid,
    faSignOut as faSignOutSolid,
    faSkull as faSkullSolid,
    faSun as faSunSolid,
    faSync as faSyncSolid,
    faTable as faTableSolid,
    faTachometer as faTachometerSolid,
    faThumbsDown as faThumbsDownSolid,
    faThumbsUp as faThumbsUpSolid,
    faTimes as faTimesSolid,
    faTimesCircle as faTimesCircleSolid,
    faTimesHexagon as faTimesHexagonSolid,
    faToolbox as faToolboxSolid,
    faUndo as faUndoSolid,
    faUpload as faUploadSolid,
    faUserCheck as faUserCheckSolid,
    faUserCircle as faUserCircleSolid,
    faUsers as faUsersSolid,
    faWrench as faWrenchSolid
} from '@fortawesome/pro-solid-svg-icons';


library.add(
    faAddressCard, faAddressCardLight, faAddressCardSolid,
    faAddressCard, faAddressCardLight, faAddressCardSolid,
    faAlignJustify, faAlignJustifyLight, faAlignJustifySolid,
    faAngleLeft, faAngleLeftLight, faAngleLeftSolid,
    faAngleRight, faAngleRightLight, faAngleRightSolid,
    faArrowDown, faArrowDownLight, faArrowDownSolid,
    faArrowToLeft, faArrowToLeftLight, faArrowToLeftSolid,
    faArrowToRight, faArrowToRightLight, faArrowToRightSolid,
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
    faExclamationTriangle, faExclamationTriangleLight, faExclamationTriangleSolid,
    faExternalLink, faExternalLinkLight, faExternalLinkSolid,
    faEye, faEyeLight, faEyeSolid,
    faEyeSlash, faEyeSlashLight, faEyeSlashSolid,
    faFilter, faFilterLight, faFilterSolid,
    faFolder, faFolderLight, faFolderSolid,
    faGift, faGiftLight, faGiftSolid,
    faGlobe, faGlobeLight, faGlobeSolid,
    faHandPaper, faHandPaperLight, faHandPaperSolid,
    faHome, faHomeLight, faHomeSolid,
    faIndustryAlt, faIndustryAltLight, faIndustryAltSolid,
    faInfoCircle, faInfoCircleLight, faInfoCircleSolid,
    faLock, faLockLight, faLockSolid,
    faMinusCircle, faMinusCircleLight, faMinusCircleSolid,
    faMoon, faMoonLight, faMoonSolid,
    faPause, faPauseLight, faPauseSolid,
    faPlay, faPlayLight, faPlaySolid,
    faPlusCircle, faPlusCircleLight, faPlusCircleSolid,
    faPrint, faPrintLight, faPrintSolid,
    faRocket, faRocketLight, faRocketSolid,
    faSave, faSaveLight, faSaveSolid,
    faSearch, faSearchLight, faSearchSolid,
    faSignIn, faSignInLight, faSignInSolid,
    faSignOut, faSignOutLight, faSignOutSolid,
    faSkull, faSkullLight, faSkullSolid,
    faSun, faSunLight, faSunSolid,
    faSync, faSyncLight, faSyncSolid,
    faTable, faTableLight, faTableSolid,
    faTachometer, faTachometerLight, faTachometerSolid,
    faThumbsDown, faThumbsDownLight, faThumbsDownSolid,
    faThumbsUp, faThumbsUpLight, faThumbsUpSolid,
    faTimes, faTimesLight, faTimesSolid,
    faTimesCircle, faTimesCircleLight, faTimesCircleSolid,
    faTimesHexagon, faTimesHexagonLight, faTimesHexagonSolid,
    faToolbox, faToolboxLight, faToolboxSolid,
    faUndo, faUndoLight, faUndoSolid,
    faUpload, faUploadLight, faUploadSolid,
    faUserCheck, faUserCheckLight, faUserCheckSolid,
    faUserCircle, faUserCircleLight, faUserCircleSolid,
    faUsers, faUsersLight, faUsersSolid,
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
    add(p)              {return fa(p, 'plus-circle')},
    addressCard(p)      {return fa(p, 'address-card')},
    angleLeft(p)        {return fa(p, 'angle-left')},
    angleRight(p)       {return fa(p, 'angle-right')},
    approve(p)          {return fa(p, 'user-check')},
    arrowToLeft(p)      {return fa(p, 'arrow-to-left')},
    arrowToRight(p)     {return fa(p, 'arrow-to-right')},
    arrowUp(p)          {return fa(p, 'arrow-up')},
    arrowDown(p)        {return fa(p, 'arrow-down')},
    arrowsLeftRight(p)  {return fa(p, 'arrows-h')},
    arrowsUpDown(p)     {return fa(p, 'arrows-v')},
    balanceScale(p)     {return fa(p, 'balance-scale')},
    bars(p)             {return fa(p, 'bars')},
    bolt(p)             {return fa(p, 'bolt')},
    book(p)             {return fa(p, 'book')},
    books(p)            {return fa(p, 'books')},
    bookmark(p)         {return fa(p, 'bookmark')},
    box(p)              {return fa(p, 'box')},
    boxFull(p)          {return fa(p, 'box-full')},
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
    code(p)             {return fa(p, 'code')},
    contact(p)          {return fa(p, 'address-card')},
    comment(p)          {return fa(p, 'comment-dots')},
    copy(p)             {return fa(p, 'copy')},
    cross(p)            {return fa(p, 'times')},
    database(p)         {return fa(p, 'database')},
    disabled(p)         {return fa(p, 'ban')},
    delete(p)           {return fa(p, 'minus-circle')},
    download(p)         {return fa(p, 'download')},
    edit(p)             {return fa(p, 'edit')},
    envelope(p)         {return fa(p, 'envelope')},
    error(p)            {return fa(p, 'times-hexagon')},
    diff(p)             {return fa(p, 'exchange')},
    eye(p)              {return fa(p, 'eye')},
    eyeSlash(p)         {return fa(p, 'eye-slash')},
    factory(p)          {return fa(p, 'industry-alt')},
    filter(p)           {return fa(p, 'filter')},
    folder(p)           {return fa(p, 'folder')},
    gauge(p)            {return fa(p, 'tachometer')},
    gear(p)             {return fa(p, 'cog')},
    gears(p)            {return fa(p, 'cogs')},
    gift(p)             {return fa(p, 'gift')},
    globe(p)            {return fa(p, 'globe')},
    grid(p)             {return fa(p, 'table')},
    hand(p)             {return fa(p, 'hand-paper')},
    home(p)             {return fa(p, 'home')},
    info(p)             {return fa(p, 'info-circle')},
    list(p)             {return fa(p, 'align-justify')},
    lock(p)             {return fa(p, 'lock')},
    login(p)            {return fa(p, 'sign-in')},
    logout(p)           {return fa(p, 'sign-out')},
    mail(p)             {return fa(p, 'envelope')},
    moon(p)             {return fa(p, 'moon')},
    office(p)           {return fa(p, 'building')},
    openExternal(p)     {return fa(p, 'external-link')},
    pause(p)            {return fa(p, 'pause')},
    play(p)             {return fa(p, 'play')},
    portfolio(p)        {return fa(p, 'briefcase')},
    print(p)            {return fa(p, 'print')},
    refresh(p)          {return fa(p, 'sync')},
    reset(p)            {return fa(p, 'undo')},
    rocket(p)           {return fa(p, 'rocket')},
    save(p)             {return fa(p, 'save')},
    search(p)           {return fa(p, 'search')},
    skull(p)            {return fa(p, 'skull')},
    sun(p)              {return fa(p, 'sun')},
    sync(p)             {return fa(p, 'sync')},
    tab(p)              {return fa(p, 'folder')},
    toolbox(p)          {return fa(p, 'toolbox')},
    thumbsDown(p)       {return fa(p, 'thumbs-down')},
    thumbsUp(p)         {return fa(p, 'thumbs-up')},
    undo(p)             {return fa(p, 'undo')},
    upload(p)           {return fa(p, 'upload')},
    user(p)             {return fa(p, 'user-circle')},
    users(p)            {return fa(p, 'users')},
    warning(p)          {return fa(p, 'exclamation-triangle')},
    wrench(p)           {return fa(p, 'wrench')},
    x(p)                {return fa(p, 'times')},
    xCircle(p)          {return fa(p, 'times-circle')}
};

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
const faIcon = elemFactory(FontAwesomeIcon);
const fa = function(props, name) {
    const prefix = (props && props.prefix) ? props.prefix : 'far';  // default to regular variant
    return faIcon({icon: [prefix, name], ...props});
};
