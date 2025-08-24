interface CustomDialogButton {
  text: string;
  value: any;
  onClick: () => void;
}

interface IApplication {
  name: string;
  title: string;
  version: string;
}

declare type DialogButton = 'ok' | 'cancel' | 'yes' | 'no' | 'copy' | CustomDialogButton;

declare type Language = 'ua' | 'ru' | 'en';

declare enum D5TitlePosition {
  Top = 0,
  Left = 1,
  Right = 2,
  OnBorder = 3,
  Floating = 4,
}

declare enum DecorDisplayType {
  LABEL = 0,
  IMAGE = 1,
  ICON = 2,
  LINK = 3,
  HTML = 4,
  FILE_VIEWER = 5,
  LINE = 6,
}

declare enum ToolBarViewType {
  NONE = 0,
  TOP_AND_CONTEXT = 1,
  TOP = 2,
  CONTEXT = 3,
}

interface D5CurrentUser {
  readonly userID: number; //RO уникальный номер пользофателя
  readonly login: string; //RO
  readonly fullName: string; //Возвращаем имя пользователя
}

interface UserLocalStorage {
  getStorageItem: (key: string) => string | null;
  setStorageItem: (key: string, value: any) => void;
  removeStorageItem: (key: string) => void;
  clearStorage: () => void;
}

interface UserSessionStorage {
  setItem: (key: string, value: any) => void;
  getItem: (key: string) => string | null;
  removeItem: (key: string) => void;
  clear: () => void;
  key: (index: number) => string | null;
  length: number;
}

declare enum FormViewMode {
  FULL_SCREEN = 1,
  MODAL = 2,
  IN_NEW_WINDOW = 3,
}

declare enum FormCreateMode {
  ADD = 'add',
  ADD_CHILD = 'addChild',
  EDIT = 'edit',
  MULTI_EDIT = 'multiEdit',
  FILTER_MODAL = 'filterModal',
  REPORT = 'report',
  FORM_SELECT = 'formSelect',
  LIST = 'listForm',
  TREE = 'treeForm',
  FREE = 'freeForm',
}

declare enum FormType {
  MAIN_FORM = -1,
  FILTER_MODAL = -2,
  SETTINGS_MODAL = -3,
  //server types
  LIST = 1,
  EDIT = 2,
  TREE = 3,
  REPORT = 4,
  MULTI_EDIT = 5,
  FREE_FORM = 99,
}

declare enum FormToolBarButtons {
  SAVE = 'save',
  CLOSE = 'close',
  APPLY = 'apply',
  SELECT = 'select',
  SAVE_CLOSE = 'saveClose',
  CANCEL = 'cancel',
}

declare interface CloseFormResolveOptions {
  button: FormToolBarButtons;
  userData: any;
}

declare interface OpeningFormOptions {
  createMode: FormCreateMode;
  id?: number | string;
  viewMode?: FormViewMode;
}

/**
 * Base interface of all the layout items are passed to user script.
 */
export interface BaseItem {
  readonly name: string;
  readonly id: number;
  readonly groupID: number | null;
  order: number;
  isVisible: boolean;
}

type ILanguage = {
  id: number;
  code: string;
  title: string;
};

/**
 * Base interface for fields, filters and decorations
 */
export interface BaseControl extends BaseItem {
  isReadOnly: boolean;
}

declare interface D5Core {
  currentUser: D5CurrentUser;
  languages: ILanguage[];
  userLocalStorage: UserLocalStorage;
  userSessionStorage: UserSessionStorage;

  lang(): Language;

  numberPrompt(title: string, defaultValue?: number): Promise<number | undefined>;

  stringPrompt(title: string, defaultValue?: string): Promise<string | undefined>;

  datePrompt(title: string, defaultValue?: Date | string): Promise<Date | string | undefined>;

  dateRangePrompt(title: string, defaultValue?: Array<Date | string>): Promise<Array<Date | string> | undefined>;

  getApplications(): IApplication[];

  getApplication(name: string): IApplication | null;

  getFormStorageData(key: string): Promise<any>;

  setFormStorageData(key: string, value: any): Promise<void>;

  removeFormStorageData(key: string): Promise<void>;

  userStorageSet(data: object): Promise<void>;

  userStorageGet(property: string): Promise<any>;

  userStorageRemove(property: string): Promise<void>;

  enumPrompt(
    title: string,
    dataSource: Record<string | number, string | number>[],
    {
      isMultiSelect,
      defaultValue,
      widget,
    }: { isMultiSelect?: boolean; defaultValue?: number | number[]; widget?: string }
  ): Promise<any | undefined>;

  showWarningDialog(text: string, buttons?: DialogButton[], title?: string): Promise<DialogButton | string>;

  showInfoDialog(text: string, buttons?: DialogButton[], title?: string): Promise<DialogButton | string>;

  showErrorDialog(text: string, buttons?: DialogButton[], title?: string): Promise<DialogButton | string>;

  showSuccessDialog(text: string, buttons?: DialogButton[], title?: string): Promise<DialogButton | string>;

  showCustomDialog(text: string, buttons?: DialogButton[], title?: string): Promise<DialogButton | string>;

  showConfirmDialog(text: string, buttons?: DialogButton[], title?: string): Promise<DialogButton | string>;

  formatNumber(value: string | number, format: string): string;

  formatDate(value: Date | string, format: string): string;

  hideLoader(): void;

  showLoader(): void;

  showInfo(msg: string, title?: string, messageTimeout?: number): void;

  showWarning(msg: string, title?: string, messageTimeout?: number): void;

  showSuccess(msg: string, title?: string, messageTimeout?: number): void;

  showError(msg: string, title?: string, messageTimeout?: number): void;

  /**
   * Якщо передано filePath, то ще додає хеш збірки для кешування ресурсу
   * @example
   * core.resourcePath('myapp');
   * core.resourcePath('myapp', '/path/img.png') // .../path/img.png?hash=123456
   * core.resourcePath('myapp', '/path/img.png?param=1') // .../path/img.png?param=1&hash=123456
   */
  resourcePath(application: string, filePath?: string): string;

  /**
   * Повертає хеш збірки застосунку
   */
  buildHash(application: string): string;

  /**
   * navigate - метод который служит для перерисовки текущей страницы без ее перезагрузки.
   * @param {string} url - часть роута, например: /subsystem/92
   */
  navigate(url: string): void;

  /**
   * newTab и newWindow работают по принципу window.open (это просто алиасы).
   * Для переброса по текущему домену приложения url обязательно нужно начинать с #, например: #/subsystem/92.
   * Для перехода на стороннюю страницу нужно указывать абсолютный путь.
   * @param {string} url
   */
  newTab(url: string): void;

  currentSubsystemName(): string;

  newWindow(url: string): void;

  /**
   * Делает запрос на сервер. Если сервер возвращает ошибку, то возвращаем полносью весь объект.
   * @param {string} objectName - имя объекта
   * @param {'List' | 'Ins' | 'Mod' | 'Del'} objectOperation - операция запроса
   * @param {Object} requestBody - тело запроса
   * @param {boolean} [plainResponse] - если true, то возвращает полный ответ такой как отдает сервер.
   * {
   * 'Response': {
   *   'App_UI20TEST_ItemGroups': [{
   *     'Parent': null,
   *     'Parent.Name': null,
   *     'ID': 7814453,
   *     'Icon': null,
   *     'Name': '801 dc'
   *   }]
   * },
   * 'ResponseCode': '000',
   * 'ResponseId': '7e195bf2-e4cf-4a3f-bd35-083dcac6b50b',
   * 'Page': 1,
   *
   *  Если нет, то возвращатеся response.Response[objectName] в формате:
   *  {
   *   'App_UI20TEST_ItemGroups': [{
   *     'Parent': null,
   *     'Parent.Name': null,
   *     'ID': 7814453,
   *     'Icon': null,
   *     'Name': '801 dc'
   *   }]
   * }
   * либо если ошибка
   * {
   * 'ResponseCode': '410',
   * 'ResponseId': '6d721454-f768-458e-b876-2542a0f15bc5',
   * 'ResponseText': 'Required filters must be filled: Национальная валюта'
   * }
   */
  execObjectOperation(
    objectName: string,
    objectOperation: string,
    requestBody: Record<string, any>,
    plainResponse?: boolean
  ): Promise<any>;

  /**
   * Делает запрос на получение данных (List). Возвращает список значенией по запрашиваемому объекту
   * @param {string} objectName - имя объекта
   * @param {Object} requestBody - тело запроса
   * @returns {Promise<Object[]>} - массив данных, которые вернул сервер в формате:
   * [{
   *     'Parent': null,
   *     'Parent.Name': null,
   *     'ID': 7814453,
   *     'Icon': null,
   *     'Name': '801 dc'
   *   }]
   *  Если результат не массив, то возвращается чистый ответ, такой как пришел в формате
   *  {
   * 'Response': ...,
   * 'ResponseCode': '000',
   * 'ResponseId': '7e195bf2-e4cf-4a3f-bd35-083dcac6b50b',
   * 'Page': 1,
   * 'PagesPredict': 1
   * }
   *
   * либо если ошибка
   * {
   * 'ResponseCode': '410',
   * 'ResponseId': '6d721454-f768-458e-b876-2542a0f15bc5',
   * 'ResponseText': 'Required filters must be filled: Национальная валюта'
   * }
   */
  loadObjectCollection(objectName: string, requestBody: Record<string, any>): Promise<any>;

  /**
   * Делает запрос на получение данных (List). Возвращает список всех значений по запрашиваемому объекту.
   * Делает постраничный запрос, пока страницы не закончатся на сервере.
   * Возвращает массив объектов, которые нужно итерировать с помощью for await... of
   * @param objectName
   * @param requestBody
   */
  objectCollectionIterator(objectName: string, requestBody: Record<string, any>): Promise<Object[]>;

  /** Открывает в текущем окне Полноэкранную форму по ID или Name. Бросает исключение если форма не найдена.
   * @param {number | string} form - ID | Name формы которую нужно открыть.
   * @param {OpeningFormOptions} options
   * @param {*} [userData] - любые данные которые передаются в форму и будут дальше передаваться во все
   *  события. Пользователь сам управляет что это может быть
   */
  openFullScreen(form: number | string, options?: OpeningFormOptions, userData?: any): void;

  /**
   * Открывает Модальную форму по ID или Name. Возвращает промис по закрытию. Бросает исключение если форма не найдена.
   * @param {number | string} form - ID | Name формы которую нужно открыть.
   * @param {OpeningFormOptions} options
   * @param {*} [userData] - любые данные которые передаются в форму и будут дальше передаваться во все
   *  события. Пользователь сам управляет что это может быть
   */
  openModal(
    form: number | string,
    options?: OpeningFormOptions,
    userData?: any
  ): Promise<CloseFormResolveOptions | void>;

  /**
   * Открывает Модальную или Полноэкранную(в текущем окне) форму по ID или Name, в зависимости от options.viewMode.
   * Бросает исключение если форма не найдена.
   * @param {number | string} form - ID | Name формы которую нужно открыть.
   * @param {OpeningFormOptions} options
   * @param {*} [userData] - любые данные которые передаются в форму и будут дальше передаваться во все
   *  события. Пользователь сам управляет что это может быть
   */
  openForm(form: number | string, options?: OpeningFormOptions, userData?: any): void;

  /**
   * Инициализация словаря переводов.
   * @param dictionary
   * @example Пример строки перевода
   * { ...
   *  "ru": {"key": 'some text {0} {1}'}
   *   ...
   * }
   *
   *  core.t('key', ['test1', 'test2']); // 'some text test1 test2'
   */
  initTranslation(dictionary: Record<'ru' | 'ua' | 'en', Record<string, string>>): void;

  /**
   * Переводит и форматирует строку из словаря переводов согласно текущего языка приложения.
   * @param msgKey
   * @param params
   *
   * @example
   *  {
   *    ...
   *    "myKey": 'some text with {0}'
   *    ...
   *  }
   *  t('myKey', ['placeholder text']) // 'some text with placeholder text'
   */
  t(msgKey: string, params?: string[]): string;
}

declare interface BaseDataSource {
  refreshData(): Promise<boolean>;

  data: Record<string, any> | Record<string, any>[];
}

declare interface ListDataSource extends BaseDataSource {
  rowsPerPage: number | 'all';
  readonly rowsData: Record<string, any>[]; //то же самое что и data
  readonly rowsCount: number;
}

declare interface D5FormDecorationElement extends BaseItem {
  title: string; //RW - Sys_Forms.Sys_DecorationElements.Title
  lineCount: number; //RW - Sys_Forms.Sys_DecorationElements.LineCount
  // 0 – label, 1 – image, 2 – icon, 3 – link, 4 – HTML, 5 - file viewer, 6 - line
  displayType: DecorDisplayType;
  displayCustomParam: string;
  text: string;
}

interface IBaseDynamicItem<Item> {
  field(name: string): Item | undefined;

  insertField(_: { name: string; title?: string; value?: any }): void;

  removeField(name: string): void;

  fields: Item[];
  name: string;
  order: number;
}

interface ID5Column {
  order: number;
  isRequired: boolean;
  isVisible: boolean;
  isCustomizable: boolean;
  isReadOnly: boolean;
  readonly name: string;
  title: string;
  readonly isBaseMultiField: boolean | undefined;
  readonly isDynamicColumn: boolean | undefined;
  readonly groupID: number;
  fixedToLeft: boolean;
  lineCount: number;
  datasource: any;
  filter: any;
  operationParams: any;
  displayValue: string | undefined;
  value: any;
  iconColor: string;
  iconSize: string;
  sortOrder: 'asc' | 'desc' | undefined;
  sortIndex: number | undefined;
}

declare interface D5DynamicColumn extends IBaseDynamicItem<ID5Column> {}

declare interface D5DynamicFormField extends IBaseDynamicItem<D5FormField> {}

declare interface D5FormField extends BaseControl {
  title: string; //RW - Sys_Forms.Sys_FormFields.Title
  isShowTitle: boolean;
  datasource: any;
  /**
   * Тип поля. string - 0, number - 1, date - 2, boolean - 3, nested - 4.
   */
  fieldType: number;
  summaryValue: number; // используется для чтения и записи итогового значения по полю
  //export diagram as svg
  exportAsSVG?: () => Promise<string | null>;
  /**
   * Используется для экспорта данных в виде объекта File.
   * Разрешается использовать только для компонент с типом File и установленным признаком IsFile.
   * @link https://developer.mozilla.org/en-US/docs/Web/API/File
   */
  exportAsFile?: () => File | null;
  // Позиція заголовку: 0 – top, 1 – left, 2 - right, 3 - on border, 4 - floating
  titlePosition: D5TitlePosition;
  isRequired: boolean; //RW - Sys_Forms.Sys_FormFields.IsRequired
  lineCount: number; //RW - Sys_Forms.Sys_FormFields.LineCount
  value: string | number | boolean | any; //RW - получение/запись значения поля
  displayValue: string; //RW - получение/запись значения поля
  operationParams: Record<string, any>; //RW - получение/запись значения поля
  color: string; //RW - получение/запись значения поля
  fontSize: string; //RW - получение/запись значения поля
  readonly parentField: D5FormField;
  filter: Record<string, any> | null /*RW - установка/получение фильтра на выпадающий список поля редактирования
              //формат {'FieldName' : {'=' : 'value'}} это равносильно {'FieldName' : 'value'}. возможны операции
               ['=' | '<>' | '<' | '>' | '<=' | '>=' | 'contains'| 'between' | 'isanyof' | 'isnotanyof' | 'isblank' | 'isnotblank']*/;
}

type FilterOperations =
  | '='
  | '<>'
  | '<'
  | '>'
  | '<='
  | '>='
  | 'contains'
  | 'between'
  | 'isanyof'
  | 'isnotanyof'
  | 'isblank'
  | 'isnotblank';

declare interface D5FormFilterField extends BaseControl {
  title: string; //RW - Sys_Forms.Sys_FormFilterFields.Title
  isRequired: boolean; //RW - Sys_Forms.Sys_FormFilterFields.IsRequired
  isShowTitle: boolean; //RW - Sys_Forms.Sys_FormFilterFields.IsShowTitle
  isCustomizable: boolean;
  // Позиція заголовку: 0 – top, 1 – left, 2 - right, 3 - on border, 4 - floating
  titlePosition: D5TitlePosition;
  /**
   * Тип поля. string - 0, number - 1, date - 2, boolean - 3, nested - 4.
   */
  fieldType: number;
  value: string | number | boolean | any; //RW  string | number | boolean | any
  displayValue: string; //RW - получение/запись значения поля
  operationParams: Record<string, any>; //RW - получение/запись значения поля
  filter: Record<string, any> | null /*RW - установка/получение фильтра на выпадающий список поля редактирования
              //формат {'FieldName' : {'=' : 'value'}} это равносильно {'FieldName' : 'value'}. возможны операции
               ['=' | '<>' | '<' | '>' | '<=' | '>=' | 'contains'| 'between' | 'isanyof' | 'isnotanyof' | 'isblank' | 'isnotblank']*/;
  operation: FilterOperations;
  defaultValue: any;
  defaultOperation: FilterOperations;

  /**
   * Only for Enums
   */
  datasource: [];
  /**
   * Value as API object
   */
  valueAsObject: Record<any, any>;
}

/**
 * Base interface for groups
 */
export interface D5FormGroup extends BaseItem {
  title: string;
  isCollapsed: boolean;
  isShowTitle: boolean;
  isActive: boolean;
  isDisabled: boolean;
  colorScheme: D5ColorScheme;
  stylingMode: D5StylingMode;
}

declare type ColorScheme = 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'main scheme';

interface D5ColorScheme {
  /**
   * Метод getCurrent() класса ColorScheme - возвращает текущие значение.
   * Может быть - default | primary | success | danger | warning | main scheme
   */
  getCurrent(): ColorScheme;

  /**
   * Метод setDefault() класса ColorScheme - устанавливает значение default.
   */
  setDefault(): void;

  /**
   * Метод setPrimary() класса ColorScheme - устанавливает значение primary.
   */
  setPrimary(): void;

  /**
   * Метод setSuccess() класса ColorScheme - устанавливает значение success.
   */
  setSuccess(): void;

  /**
   * Метод setDanger() класса ColorScheme - устанавливает значение danger.
   */
  setDanger(): void;

  /**
   * Метод setWarning() класса ColorScheme - устанавливает значение warning.
   */
  setWarning(): void;

  /**
   * Метод setMainScheme() класса ColorScheme - устанавливает значение main scheme.
   */
  setMainScheme(): void;
}

declare type StylingMode = 'none' | 'outlined' | 'contained';

interface D5StylingMode {
  /**
   * Метод getCurrent() класса StylingMode - возвращает текущие значение. Может быть - none | outlined | contained
   */
  getCurrent(): StylingMode;

  /**
   * Метод setNone() класса StylingMode - устанавливает значение none.
   */
  setNone(): void;

  /**
   * Метод setOutlined() класса StylingMode - устанавливает значение outlined.
   */
  setOutlined(): void;

  /**
   * Метод setContained() класса StylingMode - устанавливает значение contained.
   */
  setContained(): void;
}

/**
 * Base interface for buttons
 */
export interface D5FormButton extends BaseItem {
  title: string;
  isDisabled: boolean;
  isPressed: boolean;
  icon: string; //RW - получение/запись значения поля
  readonly actionForm: string | null;
  colorScheme: D5ColorScheme;
  stylingMode: D5StylingMode;
  readonly parentField: D5FormField;
}

interface D5BaseForm {
  readonly id: number;
  readonly name: string;
  readonly applicationName: string;
  readonly objectName: string;
  readonly keyField: string;
  //readonly keyValue: Array<number> | Array<string>;
  readonly parentField: string;
  title: string;
  createMode: FormCreateMode;

  insOperation: string;
  modOperation: string;
  delOperation: string;
  listOperation: string;
  operationsParams: any;

  datasource: BaseDataSource;
  /**
   * Пользовательские данные формы. Задаются из пользовательского скрипта. Передаются по ссылке.
   */
  userData?: any;

  // //Sys_Forms.Sys_FormButtons
  readonly buttons: Array<D5FormButton>; //RO array of D5FormButton. Должен работать метод buttons.length и получение по индексу buttons[0]
  /**
   * @param name - Sys_Forms.Sys_FormButtons.Name
   */
  button: (name: string) => D5FormButton | undefined; //RO возвращаем D5FormButton. Ищем где Sys_Forms.Sys_FormButtons.Name равен name

  // //Sys_Forms.Sys_FormGroups
  readonly groups: Array<D5FormGroup>; //RO array of D5FormGroup. Должен работать метод groups.length и получение по индексу groups[0]
  group: (name: string) => D5FormGroup | undefined; //возвращаем D5FormGroup. Ищем где Sys_Forms.Sys_FormGroups.Name равен name

  // //Sys_Forms.Sys_DecorationElements
  readonly decorationElements: Array<D5FormDecorationElement>; // Должен работать decorationElements.length и получение по индексу decorationElements[0]
  decorationElement: (name: string) => D5FormDecorationElement | undefined; //возвращаем DecorationElement. Ищем где Sys_Forms.Sys_DecorationElements.Name равен name

  //Sys_Forms.Sys_FormFields
  readonly fields: Array<D5FormField | D5DynamicColumn>; //RO array of D5FormField. Должен работать fields.length и получение по индексу fields[0]
  /**
   * @param name - Sys_Forms.Sys_FormFields.Name
   */
  field: (name: string) => D5FormField | D5DynamicColumn | undefined;

  //Sys_Forms.Sys_SubForms
  readonly subForms: Array<D5Form | D5TableForm | D5TreeForm>; //RO array of D5BaseForm. Должен работать subForms.length и получение по индексу subForms[0]
  subForm: (name: string) => D5Form | D5TableForm | D5TreeForm; //возвращаем D5BaseForm. Ищем где Sys_Forms.Sys_SubForms.Name равен name

  parentForm: D5Form | D5TableForm | D5TreeForm | null; //возвращаем D5BaseForm - родительскую форму. если таковой нет, возвращаем null

  /**
   * @param {boolean} [silentMode=false] - если true, то закрывает форму не вызывая диалоговые окна с подтверждением.
   */
  close(silentMode: boolean): void;

  removeSubForm: (subFormName: string) => void;
  replaceSubForm: (
    {
      name,
      nestedFieldName,
      formName,
      masterFieldName,
    }: {
      detailFieldName: string;
      name: string;
      nestedFieldName?: string;
      formName: string;
      masterFieldName: string;
    },
    destSubFormName: string
  ) => void;
  addSubForm: ({
    order,
    detailFieldName,
    name,
    nestedFieldName,
    groupName,
    formName,
    masterFieldName,
  }: {
    order: number;
    detailFieldName: string;
    name: string;
    nestedFieldName?: string;
    formName: string;
    masterFieldName: string;
    groupName: string;
  }) => void;

  autoRefreshTimeout: number;
  isAutoRefresh: boolean;
  isShowTitle: boolean;
  isModified: boolean;
  isSilentClosing: boolean;

  navigateToElement(layoutItem: BaseControl | D5BaseForm): void;

  setFocus(layoutItem: BaseControl | D5BaseForm): void;

  /**
   * Обновляет форму
   */
  refreshData(): Promise<boolean>;

  /**
   * Возвращает строку - текущий язык приложения, например ua, ru, en
   */
  lang(): Language;

  /**
   * Метод, который открывает панель фильтрации, без параметров.
   */
  showFilter(): void;

  /**
   * Метод, который открывает панель док панель фильтра(смарт папки). Без параметров.
   */
  showFilterDockPanel(): void;

  /**
   * Метод, который открывает панель редактирования с правой стороны. Без параметров.
   */
  showEditDockPanel(): void;

  /**
   * Метод, который открывает форму отчета в другой вкладке.
   * Нужно передать название отчета, на основании которого нужно создать отчет.
   * Опционально можно в userData передать customValues, в который передаем массив кастомных значений.
   * @param reportName
   * @param userData
   */
  openReportGroup(reportName: string, userData?: any): void;

  disabled: boolean;
}

/**
 * Base interface for new button
 */
interface newButtonProps {
  name: string;
  clickEvent: string;
  groupName?: string;
  order?: number;
  title?: string;
  colorScheme: number;
  dockingSide: number;
  icon?: string;
}

interface D5ListForm extends D5BaseForm {
  datasource: ListDataSource;

  filterField(name: string): D5FormFilterField; //возвращаем D5FormFilterField. Ищем где Sys_Forms.Sys_FormFilterFields.Name равен name
  readonly filterFields: Array<D5FormFilterField>; //array of D5FormFilterField. Должен работать filterFields.length и получение по индексу filterFields[0]

  toolBarViewType: ToolBarViewType;
  readonly focusedCell: D5Cell;
  readonly focusedRow: D5Row;
  readonly fields: D5FormField[];
  isFixedOrder: boolean;

  readonly subsystemName: string;

  field(name: string): D5FormField | D5DynamicColumn;

  /** Создает урл текущей формы с установленным фильтром. Можно вызывать только на родительской форме.
   *  Если вызвать на сабформе, то в результате будет null.
   *  Если фильтр не установлен, то вернет null.
   * @return {string | null}
   */
  filterUrl(): string | null;

  /** Створює нову кнопку в тулбарі і контекстному меню
   * @param name - ім'я нової кнопки
   * @param clickEvent - назва eventName, який буде прив'язаний до цієї кнопки
   * @param groupName - назва групи, до якої входить ця кнопка
   * @param colorScheme - кольорова схема кнопки
   * @param dockingSide - сторона відображення кнопки в тулбарі. Визначає, з якого боку тулбару (0 - left, 1 - right) буде розміщена кнопка
   * @param order - порядок розсташування кнопки
   * @param title - заголовок, який буде носити кнопка
   * @param icon - іконка, яка буде показана
   */
  // @ts-ignore
  addButton({ name, clickEvent, groupName, order, title, icon, colorScheme, dockingSide }: newButtonProps);

  /** Видаляє тільки ті кнопки, які були створенні в клієнтських скріптах.
   * @param name - назва кнопки
   * @return {string | null}
   */
  removeButton(name: string): void;

  /**
   * Обновляет записи по указанным ключам. Добавляет новые записи, удаляет ненайденные.
   * @param keys
   * @param [useFilter] - указывает использовать или нет фильтры примененные к форме в запросе на получение данных. По умолчанию - false
   */
  refreshRecords(keys: Array<string | number>, useFilter?: boolean): Promise<void>;

  /**
   * Добавляет сортировку для форм типа Таблицы или Дерева.
   * Передавать нужно или массив имен полей объекта, которые должны сортироваться,
   * или пустой массив(или null) для очистки сортировки.
   * @param sorting
   */
  setSorting(sorting: string[] | null): void;
}

interface D5USEvent {
  cancel: boolean;
  resolve: () => void;
  reject: () => void;
}

interface D5Row {
  readonly data: Record<string, any>; //RO - объект со значениями полей {'field1': 'value1', 'field2': 'value2'}
  readonly key: string | number;
}

declare interface D5Cell {
  rowIndex: number;
  columnIndex: number;
  cellValue: any;
}

interface D5TableForm extends D5ListForm {
  readonly focusedRow: D5Row; //RO возвращаем объект D5FormTableRow
  readonly rows: D5Row[]; //RO Array of D5FormTableRow. Должен работать rows.length и получение по индексу rows[0]
  readonly selectedRows: D5Row[]; //RO Array of D5FormTableRow. Должен работать selectedRows.length и получение по индексу selectedRows[0]
  /**
   *  Выделяет строки таблицы.
   *  Если запрашиваемый ключ не найден в таблице, то в консоле отобразится warning.
   *  @param keys - массив ключей, может быть пустым, если нужно снять выделение.
   */
  selectRowKeys(keys: Array<string | number>): void;

  /**
   * Удаляет строки в таблице по ключам.
   * @note пока работает только для nested наборов данных
   * @param keys - массив ключей, строки которых нужно удалить в таблице
   * @param remote - флаг, отвечающий за то, будут ли удалены записи на сервере
   */
  delRows(keys: string[] | number[], remote?: boolean): void;

  /**
   * Заменяет строку в таблице по ключу.
   * @note пока работает только для nested наборов данных
   * @param key - ключ, строки которую нужно заменить в таблице
   * @param newRow - новая строка
   * @param remote - флаг, отвечающий за то, будет ли запись отредактирована на сервере
   */
  editRow(key: string | number, newRow: Record<string, any>, remote?: boolean): void;

  /**
   * Добавляет строку в таблице.
   * @note пока работает только для nested наборов данных
   * @param newRow - новая строка
   * @param remote - флаг, отвечающий за то, будет ли запись добавлена на сервере
   */
  addRow(newRow: Record<string, any>, remote?: boolean): void;

  /**
   * Фиксирует заданные колонки влево.
   * @param keys
   */
  fixColumnsToLeft(keys: string[] | number[]): void;
}

interface D5TreeForm extends D5ListForm {
  selectedNodes: D5Row[]; //RO array of D5FormTreeNode
  focusedNode: D5Row; //RO D5FormTreeNode
  nodes: D5Row[]; //RO Array of D5FormTreeNode
  /**
   *  Выделяет строки дерева.
   *  Если запрашиваемый ключ не найден в дереве, то в консоле отобразится warning.
   *  @param keys - массив ключей, может быть пустым, если нужно снять выделение.
   */
  selectNodeKeys(keys: Array<string | number>): void;

  /**
   * Удаляет строки в дереве по ключам.
   * @note пока работает только для nested наборов данных
   * @param keys - массив ключей, строки которых нужно удалить в дереве
   * @param remote - флаг, отвечающий за то, будут ли удалены записи на сервере
   */
  delNodes(keys: string[] | number[], remote?: boolean): void;

  /**
   * Заменяет строку в дереве по ключу.
   * @note пока работает только для nested наборов данных
   * @param key - ключ, строки которую нужно заменить в дереве
   * @param newRow - новая строка
   * @param remote - флаг, отвечающий за то, будет ли запись отредактирована на сервере
   */
  editNode(key: string | number, newRow: Record<string, any>, remote?: boolean): void;

  /**
   * Добавляет строку в дереве.
   * @note пока работает только для nested наборов данных
   * @param newRow - новая строка
   * @param remote - флаг, отвечающий за то, будет ли запись добавлена на сервере
   */
  addNode(newRow: Record<string, any>, remote?: boolean): void;

  /**
   * Раскрывает все родительские ноды и выделяет запись с ид nodeId.
   */
  navigateToNode(nodeId: string | number): void;

  collapseRow(nodeIds: []): void;

  expandRow(nodeIds: []): void;

  collapseAll(): void;

  expandAll(): void;

  /**
   * Фиксирует заданные колонки влево.
   * @param keys
   */
  fixColumnsToLeft(keys: string[] | number[]): void;
}

interface D5Form extends D5BaseForm {
  /**
   * @param silentMode - если равен true то нотивикейшены из приложения вызываться не будут
   * @param operation
   * @throws Error - в случае каких-то ошибок бросает исключение с текстом ошибки. Если не заполнены обязательные поля,
   * то у объекта ошибки поле name - RequiredFieldsNotFilled
   * @example
   *  Button1OnClick: async (button) => {
   *   try {
   *     await form.save(true, 'Ins');
   *     core.showSuccess('Yo!')
   *  } catch (e) {
   *     if (e.name === 'RequiredFieldsNotFilled') {
   *      await core.showInfoDialog(e.message)
   *     } else {
   *       core.showError(e.message);
   *     }
   *   }
   * },
   */
  save: (silentMode: boolean, operation: string) => Promise<Response | true>; //если есть Response data возвращает response, если нет -  возвращает true
  refreshData: () => Promise<boolean>; //вызов метода обновления данных
  /**
   * Установка заголовка кнопки сохранить на формах типа редактирования
   */
  saveButtonTitle: string;

  /**
   * Режим открываемой формы редактирования
   */
  createMode: FormCreateMode;

  /**
   * Текст под заголовком открываемой формы редактирования
   */
  subTitle: string;

  filterField(name: string): D5FormFilterField; //возвращаем D5FormFilterField. Ищем где Sys_Forms.Sys_FormFilterFields.Name равен name
  readonly filterFields: Array<D5FormFilterField>; //array of D5FormFilterField. Должен работать filterFields.length и получение по индексу filterFields[0]

  /**
   * Ключевые значения
   */
  keyValue: string[] | number[];

  /**
   * Возвращает массив данных из выделеных строк которые редактируются
   */
  readonly rowsData: any[];

  /**
   * Возвращает массив данных из выделенных строк которые редактируются
   */
  readonly rows: any[];

  /**
   * Возвращает значение свойства readOnly формы редактирования
   */
  get readOnly(): boolean;

  /**
   * Возвращает или устанавливает значение операции вставки
   */
  insOperation: string;

  /**
   * Возвращает или устанавливает значение операции модификации
   */
  modOperation: string;

  /**
   * Форма со значением readOnly === true открывается только для просмотра и всем
   * formFields присваивается значение disabled = true не меняя их свойство isReadOnly
   * @param value
   */
  set readOnly(value: boolean);

  /**
   * Обновляет значения в таблице и во всех вложенных таблицах
   */
  refresh(): void;
}

interface D5SchedulerResource {
  filter: Record<string, any> | null;
  isGroup: boolean;
  name: string;
  datasource: Record<string, any>[];
}

interface D5Kanban extends D5BaseForm {}

interface D5Scheduler extends D5ListForm {
  readonly datasource: any;
  readonly resources: D5SchedulerResource[];
  startDayHour: number;
  endDayHour: number;
  selectedItems: Record<string, any>[];

  resource(name: string): D5SchedulerResource | undefined;

  addResource(resource: D5SchedulerResource): D5SchedulerResource | undefined;
}

interface D5TileList extends D5BaseForm {
  selectedTiles: Record<string, any>[];
}

interface D5ListView extends D5BaseForm {
  selectedItems: Record<string, any>[];
  /**
   * Асинхронный метод. Обновляет строки в компоненте, по заданным ключам.
   * После его выполнения в datasource обновляются данные (в том числе и selectedItems)
   * @param keys
   * @param [useFilter] - указывает использовать или нет фильтры примененные к форме в запросе на получение данных. По умолчанию - false
   */
  refreshRecords(keys: Array<string | number>, useFilter?: boolean): Promise<void>;
}
