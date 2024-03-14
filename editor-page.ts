import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
// import * as CustomEditor from "../../../../../../NEW CK/ckeditor5/build/ckeditor";
import * as CustomEditor from "./../editor-js/ckeditor";
const stylesheet = "./../editor-js/ckeditor-styles.css";
// import { CkeditorConfigService } from "@alight/controlcenter-core-lib/custom-editor";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";
import { DocumentService } from "src/app/service/document.service";
import { Observable, ReplaySubject } from "rxjs";
import { ElementRef, Renderer2, ViewChild } from "@angular/core";
import { ContentSummaryService } from "src/app/service/content-summary.service";
import { Clipboard } from "@angular/cdk/clipboard";
import { faL, faSlash } from "@fortawesome/free-solid-svg-icons";
import { MessageService } from "primeng/api";

interface Languages {
  key: string;
  value: string;
}

// declare var window: Window;
  /* istanbul ignore next */
(window as any).panelOnClickSectionTab = function(id: any) {
  console.log("panelOnClickSectionTabs" , id.id);
  let element = document.getElementById(id.id);
  if (element != null) {
      let trEle = element.parentElement.parentElement;
      console.log(trEle);
      let secTr = trEle.nextElementSibling;
      console.log(secTr);
      let val = secTr.getAttribute("class");
      if (val === "panel_content_hide") {
          secTr.setAttribute("class", "panel_content_show");
          if (id.indexOf("pan-title") === -1) {
              element.children[0].setAttribute("class", "minusIco pmicon");
          } else {
              // this.panelIcon = trEle.children[0].children[0].children[0];
              // console.log("panelIcon " + this.panelIcon);
              // this.panelIcon.setAttribute("class", "minusIco pmicon");
          }
      } else if (val === "panel_content_show") {
          secTr.setAttribute("class", "panel_content_hide");
          if (id.indexOf("pan-title") === -1) {
              element.children[0].setAttribute("class", "plusIco pmicon");
          } else {
              // this.panelIcon = trEle.children[0].children[0].children[0];
              // this.panelIcon.setAttribute("class", "plusIco pmicon");
          }
      }
  }
};

export interface uploadedDocument {
  folderPath?: string;
  documentTitle?: string;
  fileId?: string;
  attachmentMimeType?: string;
  attachmentFileName?: string;
  attachmentFileExtension?: string;
  attachmentFileStream?: any;
  aonExpression?: string;
  documentLanguage?: string;
  lastUpdated?: string;
  updatedBy?: string;
  documentDescription?: string;
  searchTags?: any;
  categories?: string;
  includeInContentLibrary?: boolean;
  upointLink?: boolean;
  topSearchResult?: boolean;
  searchable?: boolean;
  usage?: string;

}


@Component({
  selector: "app-editor-page",
  templateUrl: "./editor-page.component.html",
  styleUrls: ["./editor-page.component.scss"]
})
export class EditorPageComponent implements OnChanges, OnInit {
  @ViewChild("fileInput") fileInput: ElementRef;
  @Input() languageFromParent: any;
  @Input() editorData: any;
  @Output() getEditorData = new EventEmitter<any>();
  formClientUser: FormGroup;
  public Editor = CustomEditor;
  // public Editor = CkeditorConfigService.editor;
  @Input() allLanguagesList: any;
  config: any;
  msg: any;
  visible: boolean = false;
  ref: DynamicDialogRef;
  selectedPopulation: any = "";
  visiblePopulation: boolean = false;
  uploadDocumentForm: FormGroup;
  selectedCategory: any = null;
  populationsDialog = false;
  selectPopulationid;
  linkDialog: boolean = false;
  ssoDialog: boolean = false;
  publicDialog: boolean = false;
  intranet: boolean = false;
  documentDialog: boolean = false;
  newDocumentFlag: boolean = false;
  documentHeader: string = "";
  documentSummaryData: any;
  selectedFileTitle: any;
  organizationName: string = "";
  publicUrl: string = "";
  externalLinkHeader: string = "";
  editorExistingValue: string = "";
  newDocumentDialog: boolean = false;
  attachmentFileExtension = "";
  attachmentFileName = "";
  attachmentMimeType = "";
  uploadedPath = "UCEDocuments/Uploaded_Docs";
  uploadedFile;
  attachmentFileStream;
  uploadFileData;
  uploadedFilePath;
  base64Output;
  acceptedFiles: string = ".pdf, .doc, .docx, .xls, .xlsx, .xlsm, .ppt, .pptx";
  maxUploadedSize = 5000000;
  invalidFile: Boolean = false;
  title = "";
  titleTextLength: number = 250;
  titleTextPending: number = this.titleTextLength;
  notvalidForm: boolean;
  uploadedForm: uploadedDocument;
  defaultPopulation: string = "No_One";
  selectedLanguage: Languages;
  lang = [];
  // selectedCategories = "";
  categoryFlag: boolean = false;
  selectedCategories: any[] = [];
  userEmail = "";
  populationFilter = { name: "Population", key: "population" };
  typeFilter = { name: "File Type", key: "fileType" };
  locateFilter = { name: "Language", key: "locale" };
  lastUpdatedFilter = { name: "Last Updated", key: "lastUpdated" };
  updatedByFilter = { name: "Updated By", key: "updatedBy" };
  dataForFilter = [];
  selectedText: string = "";
  categories: any[] = [];
  selectPopulationFilter = [];
  selectedAllPopulation: boolean = false;
  cat_map = new Map();
  publicUrlError: boolean = false;
  showOverlay: boolean = false;
  imageHeader: string = "";
  newImageDialog: boolean = true;
  existingImageDialog: boolean = true;
  imageNameMaxLength = 40;
  imageNamePendingLength = this.imageNameMaxLength;
  note = "(" + this.imageNamePendingLength + " characters remaining)";
  alignment = ["Left", "Right"];
  images: any = [];
  imagesCopy: any[] = [];
  searchTerm: string = "";
  filteredFiles: any[] = [];
  allFiles: any[] = [];
  isVisibleImage: Boolean = true;
  selectedImageUrl: string = "";
  textValueName: string = "";
  alternateTextValue: string = "";
  alternateTextpendingLength = 200;
  note1 = "(" + this.alternateTextpendingLength + " characters remaining)";
  editorForm: FormGroup;
  populationsCopy = [];
  formEditorData: any = "";
  previewImage: string = "";
  selectedImagePreview: string | ArrayBuffer | null;
  imageStaticUrl: string = "https://upoint-dv.alight.com/NG15/content-pages-wc/assets/images/";
  // Predefined LinksselectedPredefinedList
  allPredefinedLinks: any = [];
  selectedPredefinedList: any;
  allPredefinedData: any = {};
  domainFilter = { name: "Domain", key: "domain" };
  pageTypeFilter = { name: "Page", key: "page" };
  baseClientFilter = { name: "BaseClient", key: "baseclient" };
  isPreLink: boolean = false;
  existinguploadedImages: any = [];
  defaultexistinguploadedImages = [];
  showImageUploadDialog = false;
  selectedExistingImage: any;
  selectedImageIndex: string = ""; //number = -1;
  existingImagesLoader = true;
  editorEvent;
  cursorPosition: any;
  cursorRange: any;
  linkEditorId: string = "";
  titleOfOpenLink: string = "";
  nodeValuefromDobleClick = "";
  selectedPredefinedDestination = "";
  checkEvent;
  checkEventOnFocus;
  removeFlagBydblClick: boolean = false;
  nodesList = [];
  selectedImageData = "";
  replaceImage = false;
  isloadedPredefinedPages = false;
  isLinked: boolean = false;
  isMultilineSelection: boolean = false;
  languagesList = [];
  // End
  populations = [  // need to update from API of population
    {
      "populationId": "1",
      "populationName": "All_Authenticated_Users",
      "linkName": "Includes all authenticated users",
      "populationType": "B"
    },
    {
      "populationId": "2",
      "populationName": "IS_YSA_FSA_STR_PRM_TILE_ELIG",
      "linkName": "IS_YSA_FSA_STR_PRM_TILE_ELIG",
      "populationType": "C"
    }
  ];
  baseCategories: any[] = [
    {
      "key": "1",
      "name": "Select All",
      "populationType": "A"
    },
    {
      "key": "2",
      "name": "Base Populations",
      "populationType": "B"
    },
    {
      "key": "3",
      "name": "Client-defined Populations",
      "populationType": "C"
    }
  ];
  uploadContentImageForm: FormGroup;
  invalidImageFile: Boolean = false;
  acceptedImagesType: string = ".png, .jpg, .jpeg, .gif";
  maxUploadedImageSize = 250000;
  attachmentImageExtension = "";
  attachmentImageFileName = "";
  attachmentImageMimeType = "";
  imageFileStreamData: any;
  showClearImageSearch = false;
  onBeforeHide: EventEmitter<any>;
  onAfterHide: EventEmitter<any>;
  showAlertDialog: boolean = false;
  saveDocError: boolean = false;
  docErrorMessage: any;
  indexselectedText: number = 0;
  editorInstacnce;
  uploadButtonDisabled = false;
  isEnabled: boolean = false;
  documentLang = [];
  startUploading = false;
  receivedLang = false;
  removePop;
  removePopText;
  copyText: any ="";
  attrMap = {};
  selectedHTML = "";
  showdblclick: Boolean  =  false;
  documentSummaryDataLoader = true;
  currentEle: boolean = false;
  boldFlag: boolean = false;
  italicFlag: boolean = false;

  get remainingCharacters(): number {
    let currentLength = 0;
    if (this.uploadContentImageForm.get("textValueName").value !== null) {
      currentLength = this.uploadContentImageForm.get("textValueName").value.length;
    }
    return this.imageNameMaxLength - currentLength;
  }

  get remainingText(): number {
    let currentLength = 0;
    if (this.uploadContentImageForm.get("alternateTextValue").value !== null) {
      currentLength = this.uploadContentImageForm.get("alternateTextValue").value.length;
    }
    return this.alternateTextpendingLength - currentLength;
  }

  /* istanbul ignore next */
  constructor(private fb: FormBuilder, public dialogService: DialogService, private contentService: ContentSummaryService,
    private documentService: DocumentService, private renderer: Renderer2, private clipboard: Clipboard, public messageService: MessageService,) {

    this.loadImages();

   this.lang = [
    { languageCode: "en_US", displayLanguageText: "English (default)"}
     /*   { key: "All_Languages", value: "All Languages" },
      { key: "ar_SA", value: "Arabic" },
      { key: "zh_CN", value: "Chinese" },
      { key: "nl_NL", value: "Dutch" },
      { key: "en_US", value: "English" },
      { key: "fr_CA", value: "French (Canada)" },
      { key: "fr_FR", value: "French (France)" },
      { key: "de_DE", value: "German" },
      { key: "it_IT", value: "Italian" },
      { key: "ja_JP", value: "Japanese" },
      { key: "pt_BR", value: "Portuguese" },
      { key: "ru_RU", value: "Russian" },
      { key: "es_US", value: "Spanish" } */
    ];
  
    this.uploadedForm = {};
  }
  /* istanbul ignore next */
  ngOnInit(): void {
    this.uploadContentImageForm = this.fb.group({
      "existingSelectedImage": new FormControl(""),
      "uploadedImageForEditor": new FormControl(""),
      "textValueName": ["", [Validators.required, Validators.maxLength(this.imageNameMaxLength)]],
      "withforCrop": new FormControl("", Validators.required),
      "textWrap": new FormControl("inline", []),
      "alignment": new FormControl("", Validators.required),
      "alternateTextValue": ["", [Validators.maxLength(this.alternateTextpendingLength)]],
    });
    // console.log("form client user in ediotr page ", this.formClientUser);
    // console.log("languageFromParent ",this.languageFromParent);

    this.formEditorData = this.editorData;
    this.populationsCopy = this.populations;


    /* istanbul ignore next */
    if (sessionStorage.getItem("userMap")) {
      let userMap = JSON.parse(sessionStorage.getItem("userMap"));
      this.userEmail = userMap.email;
    }
    this.uploadDocumentForm = this.fb.group({
      "uploaded_file": new FormControl(null, Validators.required),
      "documentTitle": new FormControl("", Validators.required),
      "documentLanguage": new FormControl("", Validators.required),
      "searchTags": new FormControl<string[] | null>(null),
      "documentDescription": new FormControl("", Validators.required),
      "categories": new FormControl([]),
      "includeInContentLibrary": new FormControl(false),
      "upointLink": new FormControl(false),
      "aonExpression": new FormControl(),
      "topSearchResult": new FormControl(false)
    });
    // this.formClientUser.controls['messageBody'].setValue("this.selectedPopulation");
    // this.config = CkeditorConfigService.config
    this.config = {
      htmlSupport: { allow: [
        {
          name: /.*/,
          attributes: true,
          // attributes: '*; onclick',
          classes: true,
          styles: true
          }
      ]},
      enterMode: this.Editor.ENTER_BR,
      shiftEnterMode: this.Editor["paragraph"],
      contentCss: [stylesheet],
      toolbar: {
        items: [
          "bold",
          "italic",
          "|",
          "removeFormat",
          "|",
          "numberedList",
          "bulletedList",
          "|",
          "outdent",
          "indent",
          "alignment",
          "|",
          // "link",
          "uploadImage",
          "insertTable",
          "|",
          "addPopulation",
          "removePopulation",
          "|",
          "links",
          // "unlinks",
          "|",
          "-",
          // "style",
          "heading",
          "strikethrough",
          "subscript",
          "superscript",
          "|",
          // "findAndReplace",
          "|",
          "undo",
          "redo",
          "copy",
          "paste",
          // 'addtabs',
          "fontColor"

        ],
        shouldNotGroupWhenFull: true
      },
      heading: {
        options: [
          { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
          { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
          { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
          { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
          { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
          { model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
          { model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" },
          { model: "formatted", view: "pre", title: "Formatted", class: "ck-heading_formatted" },
          { model: "address", view: "address", title: "Address", class: "ck-heading_address" },
          { model: "normalDiv", view: "div", title: "Normal (Div)", class: "ck-heading_normal_div" },

        ]
      },
      image: {
        toolbar: [
          // "imageTextAlternative",
          // "toggleImageCaption",
          // "imageStyle:inline",
          // "imageStyle:block",
          // "imageStyle:side",
          // "linkImage"
        ]
      },
      table: {
        contentToolbar: [
          "tableColumn",
          "tableRow",
          "mergeTableCells",
          // "tableCellProperties",
         // "tableProperties"
        ]
      },
      tableProperties: {
        border: "2px solid hsl(0, 0%, 0%);",
        class: "float-left",
      },
      fontColor: {
        colors: [
          {
            color: "hsl(120, 75%, 60%)",
            label: "Green"
          },
        ]
      },
      // indentBlock: {
      //   offset: 1,
      //   unit: "em"
      // },
      licenseKey: "",
      // removePlugins: ["Title", "style", "removeFormat"],
      placeholder: "",
    };

    this.getAllPredefinedLinks();
    this.getExistingUploadedImages();

    if(this.config !==undefined){
      this.config.allowedContent = true;
      this.config.renderUnsafeAttributes = ["onclick"];
      this.config.allowedContent =  {
        $1: {
          elements: "*",
          attributes: "*; onclick",
          classes: "*",
          styles: "*"
      }
    };
    }
    /* document.addEventListener('click', e => {
      const currentElement = document.elementFromPoint(e.clientX, e.clientY)
      console.log( document.elementFromPoint(e.clientX, e.clientY) )
      if (currentElement.querySelector('img')) {
      this.currentEle = true;
      console.log("element ", this.currentEle)
    } else {
      this.currentEle = false;
    } {passive: true}
  })  */ 

  }
  /* istanbul ignore next */
  getAllPredefinedLinks() {

    this.contentService.getPredefinedLinksForPages().subscribe({
      /* istanbul ignore next */
      next: (value) => {
        this.allPredefinedData = value;
        this.isloadedPredefinedPages = true;
        this.allPredefinedLinks = value?.predefinedLinksDetails;
      },
      error: (error) => {
        this.isloadedPredefinedPages = true;
      }
    });
  }

/* istanbul ignore next */
popupCloseStatus(closeStatus){
  if(closeStatus){
      this.ssoDialog = false;
  }
}
  /* istanbul ignore next */
  selectpredefinedLinkListValue(selected) {
    if ( Object.keys(selected).length > 0) {
      // console.log(selected, "selectedPredefinedDestination ", this.selectedPredefinedDestination, " selection ", this.selectedPredefinedList);
      let parentElement = null;
      if (this.editorEvent.model !== undefined) {
        /* istanbul ignore next */
        parentElement = this.editorEvent.model.document.selection.getFirstPosition().parent;
        const textToChange = this.editorEvent.model.change(writer => {
          this.editorEvent.model.schema.extend("paragraph", {
            allowAttributes: "id"
          });
          const link = writer.createText(this.selectedText, {
            linkHref: selected.predefinedLinkName + "~"+ this.linkEditorId // need to change destination
          });
          writer.setAttribute("id", this.linkEditorId, parentElement);
          if (this.removeFlagBydblClick) {
            let range = this.getLinkRange();
            writer.remove(writer.createRange(this.cursorRange.start, this.cursorRange.end));
            }
          this.editorEvent.model.insertContent(link);
        });
        if(this.isMultilineSelection){
          // alert("muiltiline segment me aa rha");
          // let cursorrPosition = this.getCursorPosition();
          if (this.editorEvent !== undefined && this.editorEvent.model !== undefined) {
            const selection = this.editorEvent.model.document.selection;
            let cursorrPosition= selection.getFirstRange();
            let endPocket  = cursorrPosition.end.path[1]/2;
            cursorrPosition.end.path.splice(1,1,endPocket);
            // console.log(this.cursorRange.start, cursorrPosition.end,"abcd");
            
            this.editorEvent.model.change(writer => {
              writer.remove(writer.createRange(this.cursorRange.start, cursorrPosition.end));
            });
          }
        }else{
          if (!this.removeFlagBydblClick) {
            // alert("aa rha");
            this.editorEvent.model.change(writer => {
              writer.remove(writer.createRange(this.cursorRange.start, this.cursorRange.end));
            });
          }
        }
      }
      this.isPreLink = false;
      this.ssoDialog = false;
      this.linkDialog = false;
      this.linkEditorId = "";
      this.selectedPredefinedList = null;
      this.selectedPredefinedDestination = "";
      this.selectedText = "";
      this.removeFlagBydblClick = false;
    }else{
      this.ssoDialog = true;
    }

  }
  /* istanbul ignore next */
  openSSODialog() {
    console.log("in show SSO dialog");
    this.ssoDialog = true;
    this.isPreLink = true;
    this.linkDialog = false;
    this.titleOfOpenLink = "Predefined Link";
    this.linkEditorId = "predefined_editor_id";
  }
  /* istanbul ignore next */
  searchPredefinedPage(data: any) {
    if (data !== undefined && data !== null) {
      this.allPredefinedLinks = data;
    }
  }
  /* istanbul ignore next */
  getMessageBody(ck_event: any): void {
    /* istanbul ignore next */
    console.log("changes ", ck_event);
    // console.log("eent ", ck_event);
    this.editorEvent = ck_event.editor;
    this.checkEvent = ck_event.event;
    // console.log("this.editorInstacnce.getData() ", this.editorInstacnce.getData())
    // this.formEditorData = this.editorInstacnce.getData();
    this.getEditorData.emit(this.formEditorData);
  }
  /* istanbul ignore next */
  /*    getContentMessageBody(ck_event: any): void {
      console.log("eent ", ck_event);
      this.editorEvent = ck_event.editor;
      this.checkEventOnFocus = undefined;
    }  */
  /* istanbul ignore next */
  getContentFocusMessageBody(ck_event: any): void {
    console.log("focus ", ck_event);
    this.checkEventOnFocus = ck_event.editor;
  }
  /* istanbul ignore next */
  retrieveMessageBody(): void {

  }

  /* istanbul ignore next */
  cancel() {
    // this.ref.close(product);
    this.ref.close();
  }

  /** Changes shared by shaileen  */

  /* istanbul ignore next */
  continue(): void {
    this.ref.close(this.selectedCategory);
    const population = sessionStorage.getItem("population_selectedCategory");
    this.formClientUser.controls["messageBody"].setValue("this.selectedPopulation");

  }
  /** Filter population  */
  /* istanbul ignore next */
  selectAll(): void {
    if (this.selectedAllPopulation) {
      this.selectedAllPopulation = false;
      this.selectPopulationFilter = [];
    } else {
      this.selectedAllPopulation = true;
      this.baseCategories.forEach(obj => {
        this.selectPopulationFilter.push(obj);
      });
    }

  }
  /* istanbul ignore next */
  populationType() {

    console.log("in population type ", this.selectPopulationFilter);
  }
  /* istanbul ignore next */
  applyFilter() {
    let resultData = [];

    if (this.selectPopulationFilter.length > 0) {
      this.populationsCopy.forEach(pop => {
        this.selectPopulationFilter.forEach(filter => {
          if (pop.populationType === filter.populationType) {
            resultData.push(pop);
          }
        });

      });
    }
    this.populations = resultData;
  }
  /* istanbul ignore next */
  cancelFilter() {
    this.selectPopulationFilter = [];
    this.populations = this.populationsCopy;
  }
  /* istanbul ignore next */
  /*   showPopulationDialog() {
      this.populationsDialog = true;
      if (sessionStorage.getItem("alightColleagueSessionToken")) {
        this.documentService.getAllPopulations().subscribe(
          data => {
            console.log("population data ", data);
            if (data.populationDetails.length > 0) {
              this.populations = data.populationDetails;
              this.populationsCopy = data.populationDetails;
            }
          }
        );
      }
  
    } */
    removePopulation() {
  // Remove &nbsp; from the start
  console.log("removePopulation", this.removePop);
    let myString = this.removePopText;
    myString = myString.replace(/^(&nbsp;)+/, "");

    // Remove &nbsp; from the end
    myString = myString.replace(/(&nbsp;)+$/, "");
    console.log("myString ",myString);
    this.formEditorData = this.formEditorData.toString().replace(this.removePop, myString);
    this.removePop = "";
    this.removePopText = "";
 }  
 /* istanbul ignore next */
  removePopulation1() {
    console.log("removePopulation text", this.removePopText);
    console.log("removePopulation", this.removePop);
    this.cursorPosition = this.getCursorPosition();
    console.log("cursorPosition", this.cursorPosition);
    console.log("range ", this.cursorRange.start, this.cursorRange.end);
     /*let splData1;
    let splData = this.selectedText.split("]");
    splData1 = splData[1].toString().split("[")[0];
    //  console.log(splData1);
    this.formEditorData = this.formEditorData.toString().replace("<strong>" + this.selectedText + "</strong>", splData1); */
    /** New code below */
    // Remove &nbsp; from the start
    /* let myString = this.removePopText;
    myString = myString.replace(/^(&nbsp;)+/, "");

    // Remove &nbsp; from the end
    myString = myString.replace(/(&nbsp;)+$/, ""); */
    // console.log("myString ",myString)
    // this.formEditorData = this.formEditorData.toString().replace(this.removePop, myString);
    // test code fo

    const model = this.editorEvent.model;
    const doc = model.document;
    let index = this.cursorRange.start.path[0];
    console.log("root ", doc.getRoot());
    console.log("len ", doc.getRoot().getChild(0));
    console.log("by name  ", doc.getRoot("populationstert"));
    console.log("len index ", doc.getRoot().getChild(index));
    console.log("index ", index, " pocket2 ",this.cursorRange.start.path[1] );
    const editorText = doc.getRoot().getText();
        console.log("editorText", editorText);

            // Find the start index of the target string
            const startIndex = editorText.indexOf(this.removePop);
            console.log("start index ", startIndex);

    // Update the editor view after making changes to the model
    this.editorEvent.editing.view.change(writer => {
        writer.setSelection(this.editorEvent.model.document.selection);
    });

    this.removePop = "";
    this.removePopText = "";
  }
 /* istanbul ignore next */
  isSelectionInAnchor() {
    // Get the selected text
    let selection = window.getSelection();
    
    // Check if there is a selection and it is not empty
    if (selection && selection.toString().trim() !== "") {
        // Get the range of the selection
        let range = selection.getRangeAt(0);
        console.log("range .", range, " selction ==>  ", selection);
        // Check if the parent node of the selection is an anchor tag
        if (range.commonAncestorContainer.nodeName === "A") {
            console.log("Selected text is within an anchor tag.");
            return true;
        } else {
            console.log("Selected text is not within an anchor tag.");
            return false;
        }
    } else {
        console.log("No text is selected.");
        return false;
    }
}
anchorFlag;
  /* istanbul ignore next */
  showLinkDialog() {
    this.publicUrlError = false;
    const selObj = window.getSelection();
    const selection = this.editorEvent.model.document.selection;
    const content = this.editorEvent.model.getSelectedContent(selection);
    console.log(selObj.toString(),content);
    for (let i = 0; i < content.childCount; i++) {
      const child = content.getChild(i);
      let idMap = new Map();
      idMap = child.getAttributes();   
      for( let item of idMap) {
      for(let j =0; j<item.length; j++){
        if (item[j] === "linkHref") {
            // alert("anchor hai")
            this.editorEvent.model.insertContent(this.editorEvent.model.getSelectedContent(selection));
            window.getSelection().empty();
            this.isLinked=true;
            return;
          }
        }
     }
    }
    if (selObj.toString() === "") {
      //adding code for the pop-up
      this.showAlertDialog = true;
      return;
    } else {
      this.selectedText = selObj.toString();
      console.log("select ", this.selectedText);
      this.cursorPosition = this.getCursorPosition();
      console.log(this.cursorRange,"shoeLink");
      if(this.cursorRange.start.path[0] !== this.cursorRange.end.path[0]){
        this.isMultilineSelection = true;      
      }
      
      this.formEditorData = this.formEditorData + this.selectedText;
    }
    // this.windowSelction = selObj;
    console.log(selObj.focusNode.parentElement.id);
      console.log("selects object ", selObj);
      if (selObj.toString() === "") {
        //adding code for the pop-up
        this.showAlertDialog = true;
        return;
      } else {
        this.selectedText = selObj.toString();
        console.log("select ", this.selectedText);
        this.cursorPosition = this.getCursorPosition();
        this.formEditorData = this.formEditorData + this.selectedText;
        const textToInsertData = this.editorEvent.model.change(writer => {
          writer.insertText(this.selectedText, this.cursorRange.start);
        });
      }
      this.linkDialog = true;


  }
  /* istanbul ignore next */
  cancelLinkDialog() {
    window.getSelection().empty();
    //  this.formEditorData =  this.formEditorData + this.selectedText;
    //  this.editorEvent.model.change(writer => {
    //    writer.remove(writer.createRange(this.cursorRange.start, this.cursorRange.end));
    //  });
    //   const textToInsertData = this.editorEvent.model.change(writer => {
    //     writer.insertText(this.selectedText, this.cursorRange.start);
    // });
    // this.selectedText = "";
  }
  /* istanbul ignore next */
  private getCursorPosition() {
    if (this.editorEvent !== undefined && this.editorEvent.model !== undefined) {
      const selection = this.editorEvent.model.document.selection;
      this.cursorRange = selection.getFirstRange();
      // Get the position of the cursor within the range
      const cursorPosition = this.cursorRange ? this.cursorRange.start.offset : null;
      return cursorPosition;

    }
    /* else if ( this.checkEventOnFocus !==undefined && this.checkEventOnFocus.model !== undefined) {
      const selection = this.checkEventOnFocus.model.document.selection;
      this.cursorRange = selection.getFirstRange();
      // Get the position of the cursor within the range
      const cursorPosition = this.cursorRange ? this.cursorRange.start.offset : null;
      return cursorPosition;

    } */
  }
  /* istanbul ignore next */
  openLinks() {
    let parentElement = null;
    let parentId = null;
    if (this.editorEvent.model !== undefined) {
      /* istanbul ignore next */
      parentElement = this.editorEvent.model.document.selection.getFirstPosition().parent;
      // console.log("parent openLinks ", parentElement);
      let idMap = new Map();
      if (parentElement.getAttributes()) {
        idMap = parentElement.getAttributes();
      }
      for (let item of idMap) {
        console.log(item[1]);
        parentId = item[1];
      }
    }
    console.log("parent id in open links ", parentId);
    this.publicUrl = "";
    this.organizationName = "";
    parentId = this.nodeValuefromDobleClick.split("~")[1];
    if (parentId === "public_editor_id") {
      if (this.selectedText.includes("(") && this.selectedText.includes(")")) {
        let splitData = this.selectedText.split("(");
        this.publicUrl = this.nodeValuefromDobleClick.split("~")[0];
        this.organizationName = splitData[1].split(")")[0];
      } else {
        this.publicUrl = this.nodeValuefromDobleClick.split("~")[0];
      }
      this.openExternalLinkDialog("public");
    } else if (parentId === "intranet_editor_id") {
      if (this.selectedText.match("\\(")) {
        let splitData = this.selectedText.split("(");
        this.publicUrl = this.nodeValuefromDobleClick.split("~")[0];
        this.organizationName = splitData[1].split(")")[0];
      } else {
        this.publicUrl = this.nodeValuefromDobleClick.split("~")[0];
      }
      this.openExternalLinkDialog("intranet");
    } else if (parentId === "existing_document_editor_id") {
      this.selectedFileTitle = this.nodeValuefromDobleClick.split("~")[0];
      this.openDialogForDocument("Document");
    }else if (parentId === "new_document_editor_id") {
      this.selectedFileTitle = this.nodeValuefromDobleClick.split("~")[0];
      // this.openDialogForDocument("Document");
      this.showdblclick = true;
  } else if (parentId === "predefined_editor_id") {
      for (let i = 0; i < this.allPredefinedLinks.length; i++) {
        const element = this.allPredefinedLinks[i];
        if (element.predefinedLinkName === this.nodeValuefromDobleClick.split("~")[0]) {
          this.selectedPredefinedList = element;
          // console.log("element ", this.selectedPredefinedList);
          break;
        }
      }
      // this.selectedPredefinedDestination = this.nodeValuefromDobleClick.split("~")[0];
      this.openSSODialog();
    } else if (parentId === "population_editor_id") {
      let splData1 = this.getDefaultPopulationAndText(this.selectedText);
      if (splData1.selectedData.length > 0) {
        this.selectedText = splData1.selectedData;
      }
      this.defaultPopulation = splData1.population;
      this.populationMethod();
    }
  }
  /* istanbul ignore next */
  private getDefaultPopulationAndText(data) {
    let splData1 = {
      "selectedData": "",
      "population": ""
    };
    /* istanbul ignore next */
    let splData = data.split("]");
    splData1.selectedData = splData[1].toString().split("[")[0];
    splData1.population = data.split(" ")[1].split("]")[0];
    return splData1;
  }

  /* istanbul ignore next */
  openLInkByDoubleClick(event) {
    console.log("in openLInkByDoubleClick() ");
    // const view = this.editorEvent.editing.view;
    // const viewDocument = view.document;
    console.log(event, " event openLInkByDoubleClick ");
    console.log(event.target.innerText, " event openLInkByDoubleClick ");
    // const selObj = window.getSelection();
    // view.addObserver( DoubleClickObserver );
    if (event && event.target.localName === "a") {
      this.selectedText = event.target.innerText;
      // console.log("in this.titleOfOpenLink.length () ", this.titleOfOpenLink.length , this.titleOfOpenLink);
      // let query = document.querySelector("a").href;
      // console.log("query ",query);
      if (event.target.attributes[0].nodeValue !== undefined) {
        console.log(event.target.attributes[0].nodeValue, " event openLInkByDoubleClick nodeValue");
        this.nodeValuefromDobleClick = event.target.attributes[0].nodeValue;
        document.getElementById("openExternalLinks_Editor").click();
        this.removeFlagBydblClick = true;
      }
      // this.editorEvent.editing.view.document.on('dblclick', ( evt, data ) => {
      // },{ context: 'a' })

    } else if (event && event.target.localName === "strong") {
      this.selectedText = event.target.innerText;
      this.nodeValuefromDobleClick = event.target.innerText;
      // document.getElementById("openExternalLinks_Editor").click();
      // this.removeFlagBydblClick = true;
    }
    if (event && event.target.localName === "img") {
      this.selectedImageData = event.target.alt;
      // console.log(event.target.alt, "hererereree")
      this.cursorPosition = this.getCursorPosition();
      // console.log(this.cursorPosition, "this.cursorPosition");
      if (this.selectedImageData.length > 0) {
        const selectedImageURl = event.target.currentSrc;
        // const AltValue = event.target.attributes[1].nodeValue;
        // const width = event.target.attributes[4].nodeValue;
        this.selectedImageIndex = selectedImageURl;
        // console.log(selectedImageURl);
        /* received the value from al tag of image*/
        let imgData = this.selectedImageData.split(",");
        this.openDialogForImage(1);
        this.uploadContentImageForm.controls["existingSelectedImage"].setValue(selectedImageURl);
        this.uploadContentImageForm.controls["textWrap"].setValue(imgData[1]);
        this.uploadContentImageForm.controls["alignment"].setValue(this.capitilizeString(imgData[2]));
        this.uploadContentImageForm.controls["withforCrop"].setValue(imgData[3]);
        this.uploadContentImageForm.controls["alternateTextValue"].setValue(imgData[0]);

        this.uploadContentImageForm.controls["existingSelectedImage"].markAsTouched();
        this.uploadContentImageForm.controls["withforCrop"].markAsTouched();
        this.uploadContentImageForm.controls["textWrap"].markAsTouched();
        this.uploadContentImageForm.controls["alignment"].markAsTouched();
        this.uploadContentImageForm.controls["alternateTextValue"].markAsTouched();

        this.replaceImage = true;
      }


    } else if(event && event.target.localName === "span") {
      if (event.target.id === "populationEnd") {
        let text = event.target.parentElement.innerHTML;
        let text1 = text.split("<span");
          if (text && text !== undefined) {
            console.log("text1 double ", text1);
            this.removePop = "<span"+ text1[1] + "<span"+ text1[2].split("</span>")[0] + "</span>";
          }
        this.removePopText = text.split("]</span>")[1].split("<span style")[0];
        let pop = event.target.innerText.split(" ")[1].split("]")[0];
        this.selectedPopulation = pop;
        console.log(pop, "pop in double click");
        console.log(this.removePopText, "removePopText in double click");
        console.log(this.removePop, "removePop in double click");
        this.populationsDialog = true;
      } else if (event.target.id === "populationStart") {
        let text = event.target.parentElement.outerHTML;
        let text1 = text.split("<span");
          if (text && text !== undefined) {
            console.log("text1 double ", text1);
            this.removePop = "<span"+ text1[1] + "<span"+ text1[2].split("</span>")[0] + "</span>";
          }
        this.removePopText = text.split("]</span>")[1].split("<span style")[0];
        let pop = event.target.innerText.split(" ")[1].split("]")[0];
        this.selectedPopulation = pop;
        console.log(pop, "pop in double click");
        console.log(this.removePopText, "removePopText in double click");
        console.log(this.removePop, "removePop in double click");
        this.populationsDialog = true;
      }
    }
  }
  /* istanbul ignore next */
  capitilizeString(stringData) {
    if (stringData !== undefined && stringData !== "" && stringData.length > 0) {
      return stringData.charAt(0).toUpperCase() + stringData.slice(1);
    }
  }
  /* istanbul ignore next */
  editorClick(event) {
    // alert("click")
    console.log(" editorClick ", event);
    // console.log(" event.target.firstElementChild ", event.target.firstElementChild);
    // console.log(" event.target.firstElementChild.attrtibutes", event.target.firstElementChild.attrtibutes);
    // console.log(" event.target.firstElementChild.childnodes", event.target.childNodes);
    // console.log(event.target.childNodes)
    this.nodesList = event.target.childNodes;
    let anchorText = event.target.innerHTML;
    let index = anchorText.search("<a href");
    if (index >= 0) {
      this.anchorFlag = true;
    } else {
      this.anchorFlag = false;
    }
    // if (this.nodesList && this.nodesList.length > 0) {
    //   this.nodesList.forEach(m => {console.log(m)})
    // }
    if (event.target.localName === "p" && event.target.innerHTML !== undefined ) {
      // let firrtsChild = event.target.firstElementChild.innerHTML;
      // let lastChild = event.target.lastElementChild.innerHTML;
      // let text = event.target.innerText;
      let innerHtml = event.target.innerHTML;
      let remove = "", spl = "";
      let start  = innerHtml.search("<populationstart>");//populationstart
      let end = innerHtml.search("</populationend>");
      console.log("in p tag -> start ", start , " end ", end);
      console.log("in p tag -> ineerHtml ", innerHtml);
      if (start > 0 && end > 0) {
        spl = innerHtml.slice(start, end+16);
        this.removePop = spl;
        remove = spl;
      } else {
        start  = innerHtml.search("\\[BEGIN ");//populationstart
        end = innerHtml.search("\\[END ");
        spl = innerHtml.slice(start, end);
        // console.log("spl ", spl)
        if(spl.split("[BEGIN ")[1] !== undefined) {
          // console.log("spl.split([BEGIN ) ", spl.split("[BEGIN "))
          this.defaultPopulation = spl.split("[BEGIN ")[1].split("]")[0];
          let last = "[END "+ this.defaultPopulation + "]";
          this.removePop = innerHtml.slice(start, end + last.length);
          // console.log('innerHtml.slice(start, last.length) ', innerHtml.slice(start, end + last.length))
          // console.log('this.removePop ', this.removePop)
        }
        remove = spl;

      }
      // console.log('spl ', spl)
      let removeArr = ["<populationstart>","</populationstart>", "<innertextpop>", "</innertextpop>","<populationend>","</populationend>"];
      
      // console.log("remove ", remove);
      // console.log("split ", remove.split("]")[1].split("[")[0])
      // this.removePop = spl;
      if (remove !== undefined && remove !== null && remove.length > 0 && remove.split("]")[1] !== undefined) {
        this.defaultPopulation = spl.split("[BEGIN ")[1].split("]")[0];
        this.removePopText = remove.split("]")[1].split("[")[0];

      }
        // let text = event.target.parentElement.outerHTML;
        // console.log("in span start ", text)
        // console.log('<span'+ text.split("<span")[1] + '<span'+ text.split("<span")[2]);
        let num = innerHtml.search("<span");
        if (num >= 0) {
          let text = innerHtml.split("<span");
          if (text && text !== undefined) {
            console.log("text 12221122", text );
            // console.log('<span'+ s1.split("<span")[1] + '<span'+ s1.split("<span")[2].split("</span>")[0] + '</span>')
            this.removePop = "<span"+ text[1] + "<span"+ text[2].split("</span>")[0] + "</span>";
            this.removePopText = innerHtml.split("]</span>")[1].split("<span style")[0];
            console.log("this.removePop ", this.removePop);
            console.log("this.removePopText ", this.removePopText);
  
          }

        }
      // this.removePopText = this.removePopText.replace(' ', '&nbsp;');
      // console.log("this.removepop  ", this.removePop)

    } else if (event.target.localName === "populationend" && event.target.innerHTML !== undefined) {
      let text = event.target.innerHTML;
      // console.log("in populationend tag ->  text ", text);
      let pop = text.split(" ")[1].split("]")[0];
      // console.log("pop ", pop);
      let parentElementHTML = event.target.parentElement.innerHTML;
      console.log("in populationend tag ->  parentElementHTML ", parentElementHTML);
      let s2 = "</populationend>";
      let start, end;
      start = parentElementHTML.search("<populationstart>");
      end = parentElementHTML.search("</populationend>");
      this.removePop = parentElementHTML.slice(start, end+s2.length);
      this.defaultPopulation = this.removePop.split("[BEGIN ")[1].split("]")[0];
      let s3 = "<innertextpop>";
      let s4 = "</innertextpop>";
      let start1, end1;
      start1 = parentElementHTML.search("<innertextpop>");
      end1 = parentElementHTML.search("</innertextpop>");
      this.removePopText = parentElementHTML.slice(start1+s3.length, end1);
      
    } else if (event.target.localName === "populationstart" && event.target.innerHTML !== undefined) {
      let text = event.target.innerHTML;
      let nextSibling = event.target.nextSibling.innerHTML;
      console.log("in populationstart tag ->  text ", text, " next sibling ", nextSibling);
      let pop = text.split(" ")[1].split("]")[0];
      pop = pop.replace(" ", "&nbsp;");
      // let removeArr = ['<populationstart>','</populationstart>', '<innertextpop>', '</innertextpop>','<populationend>','</populationend>'];
      this.removePop = "<populationstart>"+ text + "</populationstart>" + "<innertextpop>"+ nextSibling + "</innertextpop><populationend>[END "+ pop + "]&nbsp;</populationend>";
      this.removePopText = nextSibling;
      this.removePopText = this.removePopText.replace(" ", "&nbsp;");
      // console.log("this.removepop  ", this.removePop)
      // console.log("this.removePopText  ", this.removePopText)
      this.defaultPopulation = text.split("[BEGIN ")[1].split("]")[0];
    } else if (event.target.localName === "innertextpop" && event.target.innerHTML !== undefined) {
      let text = event.target.innerHTML;
      let nextSibling = event.target.nextSibling.innerHTML;
      console.log("in innertextpop tag ->  text ", text, " next sibling ", nextSibling);
      let pop = nextSibling.split(" ")[1].split("]")[0];
      // let removeArr = ['<populationstart>','</populationstart>', '<innertextpop>', '</innertextpop>','<populationend>','</populationend>'];
      this.removePop = "<populationstart>&nbsp;[BEGIN "+ pop + "]</populationstart><innertextpop>" + text + "</innertextpop><populationend>" + nextSibling + "</populationend>";
      this.removePopText = text;
      // this.removePopText = this.removePopText.replace(' ', '&nbsp;');
      // console.log("remove pop ", this.removePop);
      this.defaultPopulation = pop;
    } else if (event.target.localName === "span" && event.target.innerHTML !== undefined ) {
      let text = "";
      // on click at last 
      if (event.target.parentElement && event.target.parentElement.innerHTML !== undefined) {
        text = event.target.parentElement.innerHTML;
        console.log("in span end ", text);
        ////
        let text1 = text.split("<span");
          if (text && text !== undefined) {
            console.log("text1 77 ", text1);
            if (text1[2] !== undefined) {
              this.removePop = "<span"+ text1[1] + "<span"+ text1[2].split("</span>")[0] + "</span>";
            }
          }
        /////
        this.removePopText = text.split("]</span>")[1].split("<span style")[0];
        console.log("this.removePop ", this.removePop);
        console.log("this.removePopText ", this.removePopText);
      } else {
        text = event.target.parentElement.outerHTML;
        console.log("in span start ", text);
        ////
        let text1 = text.split("<span");
          if (text && text !== undefined) {
            console.log("text1 66 ", text1);
            this.removePop = "<span"+ text1[1] + "<span"+ text1[2].split("</span>")[0] + "</span>";
          }
        /////
        this.removePopText = text.split("]</span>")[1].split("<span style")[0];
        console.log("this.removePop ", this.removePop);
        console.log("this.removePopText ", this.removePopText);
      }
    }
  }
  /* istanbul ignore next */
  getParentId() {
    let parentId = null;
    /* istanbul ignore next */
    let parentElement;
    /* istanbul ignore next */
    if (this.editorEvent.model !== undefined) {
      /* istanbul ignore next */
      parentElement = this.editorEvent.model.document.selection.getFirstPosition().parent;
      // console.log("parent openLinks ", parentElement);
       /* istanbul ignore next */
      let idMap = new Map();
       /* istanbul ignore next */
      if (parentElement.getAttributes()) {
        idMap = parentElement.getAttributes();
      }
       /* istanbul ignore next */
      for (let item of idMap) {
        console.log(item[1]);
        parentId = item[1];
      }
    }
    return parentId;
  }
  /* istanbul ignore next */
  showUnLink(event) {
    this.selectedText = window.getSelection().toString();
    const model = this.editorEvent.model;
    const selection = model.document.selection;
    const ranges = model.schema.getValidRanges(selection.getRanges(), "linkHref");
    const linkCommand = this.editorEvent.commands.get("link");
    let parentId = this.getParentId();
    if (parentId === "existing_document_editor_id") {
      this.selectedFileTitle = null;
    }
    if (selection.hasAttribute("linkHref")) {
      this.isEnabled = true;
    }
    if (this.isEnabled) {
      this.cursorPosition = this.getCursorPosition();
      console.log("cursor ", this.cursorPosition);
      this.editorEvent.model.change(writer => {
        // Remove `linkHref` attribute from specified ranges.
        const rangesToUnlink = selection.isCollapsed ?
          [this.editorEvent.model.document.findAttributeRange(
            selection.getFirstPosition()!,
            "linkHref",
            selection.getAttribute("linkHref"),
            model
          )] :
          model.schema.getValidRanges(selection.getRanges(), "linkHref");
        console.log("rangesToUnlink ", rangesToUnlink);
        for (const range of rangesToUnlink) {
          writer.removeAttribute("linkHref", range);
          // If there are registered custom attributes, then remove them during unlink.
          if (linkCommand) {
            for (const manualDecorator of linkCommand.manualDecorators) {
              writer.removeAttribute(manualDecorator.id, range);
            }
          }
        }
        // writer.removeSelectionAttribute( "linkHref" );
      });
      this.editorEvent.model.change(writer => {
        writer.insertText(this.selectedText, this.cursorRange.start);
      });
    } else {
      this.cursorPosition = this.getCursorPosition();
      this.editorEvent.model.change(writer => {
        writer.remove(writer.createRange(this.cursorRange.start, this.cursorRange.end));
      });
      this.editorEvent.model.change(writer => {
        writer.insertText(this.selectedText, this.cursorRange.start);
      });
    }
    this.selectedText = "";
    this.isEnabled = false;
  }

  /* istanbul ignore next */
  openExternalLinkDialog(data) {
    console.log("in show SSO dialog");
    this.publicDialog = true;
    this.linkDialog = false;
    if (data === "intranet") {
      this.intranet = true;
      this.externalLinkHeader = "Link to an Intranet Page";
      this.titleOfOpenLink = "Intranet";
      this.linkEditorId = "intranet_editor_id";
    } else {
      this.intranet = false;
      this.externalLinkHeader = "Link to a Public Website";
      this.titleOfOpenLink = "Public Website";
      this.linkEditorId = "public_editor_id";
    }
  }
  /* istanbul ignore next */
  setPublicLink() {
    console.log("in set Public Link ");
    console.log(this.publicUrl, this.organizationName);
    // this.editorExistingValue = this.formClientUser.controls["messageBody"].value;
    this.editorExistingValue = this.formEditorData;
    // this.indexselectedText = this.formEditorData.search(this.selectedText);
    const selection = this.editorEvent.model.document.selection;
    const range = selection.getFirstRange();
    // Get the position of the cursor within the range
    const cursorPosition = range ? range.start.offset : null;
    // this.cursorPosition = this.getCursorPosition();
    // console.log("this.indexselectedText ",this.indexselectedText, range);
    // console.log("this.cusrsorposition ",this.cursorPosition);
    let tag = null;

    if (this.publicUrl.length === 0) {
      this.publicUrlError = true;
      return;
    } else {
      this.publicUrlError = false;
    }
    let org = "";
    if (this.organizationName.length === 0) {
      tag = "<a href=\"" + this.publicUrl + "\" class = \"publicEditor_class\">" + this.selectedText + "</a>";
      // this.editorExistingValue = this.editorExistingValue + "<a href=\"" + this.publicUrl + "\"> " + this.selectedText + "</a>";
    } else {
      tag = "<a href=\"" + this.publicUrl + "\">" + this.selectedText + "(" + this.organizationName + ")</a>";
      org = "(" + this.organizationName + ")";
      // this.editorExistingValue = this.editorExistingValue + "<a href=\"" + this.publicUrl + "\"> " + this.selectedText + "(" + this.organizationName + ")</a>";
    }

    let str = "";
    if (this.editorEvent.model !== undefined) {
      const textToChange = this.editorEvent.model.change(writer => {
        //  const div =  writer.createElement('div', { class: 'publicEditor_class'})
        // console.log(this.editorEvent.model.document.selection.getSelectedElement(), " text ");
        // console.log(this.editorEvent.model.document.selection.getFirstPosition().parent, " parent ");
        let parentElement = null;
        /* istanbul ignore next */
        parentElement = this.editorEvent.model.document.selection.getFirstPosition().parent;
        this.editorEvent.model.schema.extend("paragraph", {
          allowAttributes: "id"
        });
        const link = writer.createText(this.selectedText + org, {
          linkHref: this.publicUrl + "~" + this.linkEditorId
        });
        str = link;
        writer.setAttribute("id", this.linkEditorId, parentElement);
        if (this.removeFlagBydblClick) {
          let range1 = this.getLinkRange();
          writer.remove(writer.createRange(this.cursorRange.start, this.cursorRange.end));
        }
        this.editorEvent.model.insertContent(link);

      });

      // console.log(this.cursorRange.end.path[0],this.cursorRange.end.path[1],this.cursorRange,"cursor",cursorPosition);
      // for multi line selection
      if(this.isMultilineSelection){
        // alert("muiltiline segment me aa rha");
        // let cursorrPosition = this.getCursorPosition();
        if (this.editorEvent !== undefined && this.editorEvent.model !== undefined) {
          // const selection = this.editorEvent.model.document.selection;
          let cursorrPosition= selection.getFirstRange();
          let endPocket  = cursorrPosition.end.path[1]/2;
          cursorrPosition.end.path.splice(1,1,endPocket);
          // console.log(this.cursorRange.start, cursorrPosition.end,"abcd");
          
          this.editorEvent.model.change(writer => {
            writer.remove(writer.createRange(this.cursorRange.start, cursorrPosition.end));
          });
        }
      }else{
        if (!this.removeFlagBydblClick) {
          // alert("aa rha");
          this.editorEvent.model.change(writer => {
            writer.remove(writer.createRange(this.cursorRange.start, this.cursorRange.end));
          });
        }
      }

    }
    // console.log(this.formEditorData.search("<a href=\"" + this.publicUrl ));
    // console.log(this.formEditorData.toString().split(">" + this.selectedText  ));
    //  this.formEditorData = this.formEditorData.toString().split(">" + this.selectedText )[0] + " class: \"publiUrl_Editor\"" + this.formEditorData.toString().split(">" + this.selectedText )[1] 
    // console.log(this.formEditorData);

    // this.pageTypeFilter;
    this.publicDialog = false;
    this.intranet = false;
    this.publicUrl = "";
    this.organizationName = "";
    this.linkEditorId = "";
    this.selectedText = "";
    this.removeFlagBydblClick = false;
  }
  /* istanbul ignore next */
  openDialogForDocument(data) {
    this.linkDialog = false;
    if (data === "New Document") {
      this.newDocumentFlag = true;
      this.newDocumentDialog = true;
      this.documentHeader = "New Document";
      this.titleOfOpenLink = "New Document";
      this.linkEditorId = "new_document_editor_id";
      if(this.receivedLang){
        this.uploadDocumentForm.controls["documentLanguage"].setValue(this.lang[0].languageCode);
        this.uploadDocumentForm.controls["documentLanguage"].markAllAsTouched();
      }
    } else {
      this.documentDialog = true;
      this.newDocumentFlag = false;
      this.newDocumentDialog = false;
      this.documentHeader = "Choose Existing Document";
      this.titleOfOpenLink = "Existing Document";
      this.linkEditorId = "existing_document_editor_id";
      this.loadDocumentData();
    }
  }
  /* istanbul ignore next */
  setDocumentLink() {
    console.log("selected file ", this.selectedFileTitle);
    if (this.selectedFileTitle === undefined || this.selectedFileTitle === null) {
      return;
    } else {
      this.documentDialog = false;
      this.newDocumentFlag = false;
      console.log("selectedFileTitle ", this.selectedFileTitle);
      this.editorExistingValue = this.formEditorData;
      this.indexselectedText = this.formEditorData.search(this.selectedText);
      // console.log("this.indexselectedText ",this.indexselectedText);
      let tag = "<a href=\"" + this.selectedFileTitle + "\"> " + this.selectedText + "</a>";
      // this.editorExistingValue = this.editorExistingValue + "<a href=\"" + this.selectedFileTitle + "\"> " + this.selectedText + "</a>";
      let parentElement = null;
      if (this.editorEvent.model !== undefined) {
        /* istanbul ignore next */
        parentElement = this.editorEvent.model.document.selection.getFirstPosition().parent;
        const textToChange = this.editorEvent.model.change(writer => {
          this.editorEvent.model.schema.extend("paragraph", {
            allowAttributes: "id"
          });
          const link = writer.createText(this.selectedText, {
            linkHref: this.selectedFileTitle + "~" + this.linkEditorId
          });
          writer.setAttribute("id", this.linkEditorId, parentElement);
          if (this.removeFlagBydblClick) {
            let range = this.getLinkRange();
            writer.remove(writer.createRange(this.cursorRange.start, this.cursorRange.end));
          }
          this.editorEvent.model.insertContent(link);
        });
        if(this.isMultilineSelection){
          // alert("muiltiline segment me aa rha");
          // let cursorrPosition = this.getCursorPosition();
          if (this.editorEvent !== undefined && this.editorEvent.model !== undefined) {
            const selection = this.editorEvent.model.document.selection;
            let cursorrPosition= selection.getFirstRange();
            let endPocket  = cursorrPosition.end.path[1]/2;
            cursorrPosition.end.path.splice(1,1,endPocket);
            // console.log(this.cursorRange.start, cursorrPosition.end,"abcd");
            
            this.editorEvent.model.change(writer => {
              writer.remove(writer.createRange(this.cursorRange.start, cursorrPosition.end));
            });
          }
        }else{
          if (!this.removeFlagBydblClick) {
            // alert("aa rha");
            this.editorEvent.model.change(writer => {
              writer.remove(writer.createRange(this.cursorRange.start, this.cursorRange.end));
            });
          }
        }
      }
      this.selectedText = "";
      this.linkEditorId = "";
      this.removeFlagBydblClick = false;
      this.selectedFileTitle = null;
    }
  }
  /* istanbul ignore next */
  loadDocumentData() {
    this.documentSummaryData = [];
    this.dataForFilter = [];
    console.log("load document summary data");
    this.documentService.getDocumentSummaryData().subscribe(data => {
      this.documentSummaryDataLoader = false;
      console.log("data len ", data.length);
      this.documentSummaryData = data;
      this.dataForFilter = data;
    }, error =>{
      console.log(error);
      this.documentSummaryDataLoader = false;
    }
    );
  }
  /* istanbul ignore next */
  search(data: any) {
    if (data !== undefined && data !== null) {
      this.documentSummaryData = data;
    }
  }
  /***************** Code for CReate new Document ************************/

  /* istanbul ignore next */
  handleFile(event: any) {
    this.uploadedFile = event.target.files[0];
    let fileSize = this.uploadedFile.size;
    let fileName = this.uploadedFile.name;
    if (!(this.acceptedFiles.includes(this.attachmentFileExtension)) || fileSize > this.maxUploadedSize) {
      this.invalidFile = true;
      this.uploadDocumentForm.controls["uploaded_file"].setValue(null);
    } else {
      this.attachmentFileName = this.uploadedFile.name.split(".")[0];
      this.attachmentFileExtension = this.uploadedFile.name.split(".").pop().toLowerCase();
      this.attachmentMimeType = this.uploadedFile.type;
      const size = this.uploadedFile.size;
      // this.attachmentFileStream = btoa(this.uploadedFile);
      // let reader = new FileReader();
      //   reader.onload = (e) => {
      //     this.attachmentFileStream = e.target.result;
      //   console.log(this.attachmentFileStream);
      //   };
      // reader.readAsDataURL(this.uploadedFile);
      // }
      this.invalidFile = false;
    }
  }
  /* istanbul ignore next */
  changeTitleCount() {
    this.titleTextPending = this.titleTextLength - this.uploadDocumentForm.controls["documentTitle"].value.length;
    if (this.titleTextPending === 0) {
      return false;
    }
  }
  /* istanbul ignore next */
  onKeyDown(event: KeyboardEvent) {
    // console.log(event);
    if (event.key === ";" || event.key === " ") {
      event.preventDefault();
      const element = event.target as HTMLElement;
      element.blur();
      element.focus();
    }
  }
  /* istanbul ignore next */
  checkInput(event) {
    if (this.checkSpecialCharacter(event.value)) {
      this.uploadDocumentForm.controls["searchTags"].value?.pop(); // remove last entry from values
    }
  }
  /* istanbul ignore next */
  checkSpecialCharacter(value) {
    let format = /[/&#@+/%><\/?]+/;
    if (format.test(value)) {
      return true;
    } else {
      return false;
    }
  }
  /* istanbul ignore next */
  contentIDGenerator() {
    let regExValue = "abcdefghijklmnopqrstuvwxyz1234567890";
    let text1 = "";
    let text2 = "";
    let text3 = "";
    let text4 = "";
    let text5 = "";
    for (let i = 0; i < 8; i++) {
      text1 += regExValue.charAt(Math.floor(Math.random() * regExValue.length));
    }
    for (let i = 0; i < 4; i++) {
      text3 += regExValue.charAt(Math.floor(Math.random() * regExValue.length));
    }
    for (let i = 0; i < 4; i++) {
      text4 += regExValue.charAt(Math.floor(Math.random() * regExValue.length));
    }
    for (let i = 0; i < 12; i++) {
      text5 += regExValue.charAt(Math.floor(Math.random() * regExValue.length));
    }
    text2 = Math.floor(1000 + Math.random() * 9000).toString();
    return text1 + "-" + text2 + "-" + text3 + "-" + text4 + "-" + text5;
  }
  /* istanbul ignore next */
  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    // console.log(reader.readAsArrayBuffer(file));
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    console.log(result);
    return result;
  }
  /* istanbul ignore next */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  /* istanbul ignore next */
  saveNewDocument() {
    
    /* istanbul ignore next */
    let fileUploadReqData;
    // console.log(this.uploadDocumentForm.value);
    /* istanbul ignore next */
    const data = this.uploadDocumentForm.value;
    /* istanbul ignore next */
    if (this.uploadDocumentForm.valid) {
      this.startUploading = true;
      this.notvalidForm = false;

      let searchTags = "";
      /* istanbul ignore next */
      if (data["searchTags"] && data["searchTags"].length > 0) {
        searchTags = data["searchTags"].join(", ");
      }
      let cats = data["categories"];
      if(cats !== null ){
        cats = cats.toString();
      }
      console.log(data);
      let formValues = this.uploadDocumentForm.getRawValue();

      let oldData = {
        "uploaded_file": "",
        "documentTitle": "",
        "documentLanguage": "",
        "searchTags": null,
        "documentDescription": "",
        "categories":"",
        "includeInContentLibrary": false,
        "upointLink": false,
        "aonExpression": "",
        "topSearchResult": false
    };
      console.log("uploadedPath ==> ", this.uploadedPath);
      this.uploadedForm["folderPath"] = this.uploadedPath;
      this.uploadedForm["documentTitle"] = data["documentTitle"];
      this.uploadedForm["fileId"] = this.contentIDGenerator();
      this.uploadedForm["attachmentMimeType"] = this.attachmentMimeType;
      this.uploadedForm["attachmentFileName"] = this.attachmentFileName;
      this.uploadedForm["attachmentFileExtension"] = this.attachmentFileExtension;
      this.uploadedForm["attachmentFileStream"] = this.base64Output;
      this.uploadedForm["documentTitle"] = data["documentTitle"];
      this.uploadedForm["documentLanguage"] = data["documentLanguage"];
      this.uploadedForm["lastUpdated"] = Date.now().toString();      // 
      this.uploadedForm["updatedBy"] = this.userEmail; //
      this.uploadedForm["documentDescription"] = data["documentDescription"];
      this.uploadedForm["searchTags"] = searchTags;
      this.uploadedForm["categories"] = cats;
      this.uploadedForm["aonExpression"] = data["aonExpression"];
      this.uploadedForm["includeInContentLibrary"] = data["includeInContentLibrary"];
      this.uploadedForm["upointLink"] = data["upointLink"];
      this.uploadedForm["topSearchResult"] = data["topSearchResult"];
      this.uploadedForm["searchable"] = true; // need to check for this
      this.uploadedForm["usage"] = "test"; // need to check for this
      /* istanbul ignore next */

      let traceChangesArray = this.contentService.getJsonDiffForRule(oldData, formValues, this.lang);

      this.convertFile(this.uploadedFile).subscribe(base64 => {
        this.base64Output = base64;
        // console.log(this.base64Output, "444");
        this.uploadedForm["attachmentFileStream"] = base64;
        console.log(this.uploadedForm);
        /* istanbul ignore next */
        this.documentService.addNewDocumentFile(this.uploadedForm).subscribe({
          /* istanbul ignore next */
          next: (result: any) => {
            this.startUploading = false;
            console.log(result, "result");
            if (result.responseStatus === "Success") {
              this.messageService.clear();
            this.messageService.add({ severity: "success", summary: "", detail: "Document Added Successfully" });
            this.contentService.triggerEditEventForDocument(traceChangesArray,data["documentTitle"],"Create" ).subscribe( triggerData =>{
              console.log(triggerData);
            } );
              this.selectedImageIndex = result.serverFilePath;
              this.newDocumentDialog = false;
              this.newDocumentFlag = false;
              this.uploadDocumentForm.reset();
              /*  this.formEditorData = this.editorExistingValue;
               // this.editorExistingValue = this.formClientUser.controls["messageBody"].value;
               this.editorExistingValue = this.editorExistingValue + "<a href=\"" + data["documentTitle"] + "\"> " + this.selectedText + "</a>";
               // this.formClientUser.controls["messageBody"].setValue(this.editorExistingValue);
               // this.formEditorData = this.editorExistingValue; */
              let parentElement = null;
              if (this.editorEvent.model !== undefined) {
                /* istanbul ignore next */
                parentElement = this.editorEvent.model.document.selection.getFirstPosition().parent;
                const textToChange = this.editorEvent.model.change(writer => {
                  this.editorEvent.model.schema.extend("paragraph", {
                    allowAttributes: "id"
                  });
                  const link = writer.createText(this.selectedText, {
                    linkHref: data["documentTitle"] + "~"+ this.linkEditorId
                  });
                  writer.setAttribute("id", this.linkEditorId, parentElement);
                  this.editorEvent.model.insertContent(link);
                });
                this.editorEvent.model.change(writer => {
                  writer.remove(writer.createRange(this.cursorRange.start, this.cursorRange.end));
                });
              }
              this.selectedText = "";
              this.linkEditorId = "";
            }

          },
          /* istanbul ignore next */
          error: (error) => {
            // console.log(error.error);
            // let err = error.error;
            this.startUploading = false;
            console.log(error.error);
            let err = error.error;
            this.saveDocError = true;
            // let msg = error.error.responseMessage
            // this.docErrorMessage = msg.split("-")
            this.docErrorMessage = "Duplicate Document Name, Document name already exist in project";

            // this.messageService.add({ severity: "error", summary: err.responseStatus, detail: err.responseMessage });

          }
        });

      });


      // 
    } else {
      /* istanbul ignore next */
      // window.scroll({ top: 0, left: 0 });
     const uploadDocForm= document.getElementById("uploadDocForm");
     if(uploadDocForm !==null && uploadDocForm !==undefined){
      uploadDocForm.scrollIntoView();
     }
      this.notvalidForm = true;
      this.validateAllFormFields(this.uploadDocumentForm);
    }
  }
  /* istanbul ignore next */
  isFieldValid(field: string) {
    return this.uploadDocumentForm.controls[field].invalid && this.uploadDocumentForm.controls[field].touched;
  }
  /* istanbul ignore next */
  isFieldValidForImage(field: string) {
    return this.uploadContentImageForm.controls[field].invalid && this.uploadContentImageForm.controls[field].touched;
  }
  /* istanbul ignore next */
  openCategory() {
    if (this.categoryFlag) {
      this.categoryFlag = false;
    } else {
      this.categoryFlag = true;
    }
    this.documentService.getCategories().subscribe({
      /* istanbul ignore next */
      next: (data) => {
        this.categories = [];
        this.categories = data["categoryList"];
      }, error: (error) => {
        /* istanbul ignore next */
        console.log(error);
      }
    });
    console.log("open category ", this.uploadDocumentForm.controls);
  }
  /* istanbul ignore next */
  selectCategory(data, index) {
    this.selectedCategories = [];
    let controlName = "cat_checkBox" + index;
    console.log("selectCategory ", data);
    if (this.cat_map.has(controlName)) {
      this.cat_map.delete(controlName);
    } else {
      this.cat_map.set(controlName, data);
    }
    for (let i of this.cat_map.keys()) {
      console.log("map value ", this.cat_map.get(i));
      this.selectedCategories.push(this.cat_map.get(i));
      console.log("this.selectedCategories ", this.selectedCategories);
    }
    this.uploadDocumentForm.controls["categories"].setValue(this.selectedCategories);
    console.log("open category ", this.uploadDocumentForm.controls);
  }

  /**  Updated code for population search  */

  /* istanbul ignore next */
  search1(data: any) {
    if (data !== undefined && data !== null) {
      this.populations = data;
    }
  }
  /* istanbul ignore next */
  ngOnChanges(changes: SimpleChanges) {
    const formdata = this.formEditorData;
    // console.log("changes ", changes);
    if (changes !== undefined || changes !== null) {
      this.formEditorData = this.editorData;
    }
    if (this.languageFromParent !== undefined) {
      this.lang = [];
      this.receivedLang = true;
      this.lang = this.languageFromParent;
      console.log(this.lang, "this.lang this.lang");
    }
    // this.getAllPredefinedLinks();
    if(this.allLanguagesList !==undefined){
      this.languagesList = this.allLanguagesList;
    }
  }

  // Add Image code
  /* istanbul ignore next */
  showOverlaypanel() {
    this.showOverlay = true;
    const selObj = window.getSelection();
    this.selectedText = selObj.toString();
        // console.log("select ", this.selectedText);
        this.cursorPosition = this.getCursorPosition();
        this.formEditorData = this.formEditorData + this.selectedText;
        if (this.editorEvent && this.editorEvent.model !== undefined) {
          const textToInsertData = this.editorEvent.model.change(writer => {
            writer.insertText(this.selectedText, this.cursorRange.start);
          });
        }
      
    // console.log("clicked"); 
    window.getSelection().empty();
  }

  /* istanbul ignore next */
  openDialogForImage(data) {

    this.showOverlay = false;
    this.showImageUploadDialog = true;
    if (data === 0) {
      this.newImageDialog = true;
      this.existingImageDialog = false;
      this.imageHeader = "Upload Image";
      this.uploadContentImageForm.controls["textWrap"].setValue("block");
      this.uploadContentImageForm.controls["textValueName"].setValidators([Validators.required]);
      this.uploadContentImageForm.controls["uploadedImageForEditor"].setValidators([Validators.required]);
    } else {
      this.existingImageDialog = true;
      this.newImageDialog = false;
      this.getExistingUploadedImages();
      this.uploadContentImageForm.controls["textValueName"].clearValidators();
      this.uploadContentImageForm.get("uploadedImageForEditor").clearValidators();

      this.uploadContentImageForm.controls["textWrap"].setValue("block");
      this.uploadContentImageForm.controls["textWrap"].markAsTouched();

      this.imageHeader = "Choose Existing Image";
    }
  }

  /* istanbul ignore next */
  onUpload(event: any) {
    if (event.files && event.files.length > 0) {
      const selectedImage = event.files[0];
      if (selectedImage && selectedImage.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImagePreview = e.target.result;
        };
        reader.readAsDataURL(selectedImage);
      } else {
        console.log("selected non image file type");

      }
    }
    let upsrc: any = "<img src=" + "selectedImagePreview" + ">";
    this.formEditorData = this.formEditorData + upsrc;
  }

  /* istanbul ignore next */
  loadImages() {
    for (let i = 1; i <= 7; i++) {
      const imagepath = "../../../assets/images/image" + i + ".jpg";
      let imgObj = {
        "file": imagepath,
        "filename": "image" + i
      };
      this.images.push(imgObj);
      this.allFiles.push(imgObj.filename);
      this.imagesCopy.push(imgObj);
      // console.log(this.images);

    }
  }

  /* istanbul ignore next */
  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log("Uploaded image:", file);

    }
  }

  /* istanbul ignore next */
  selectImage(image, index) {
    console.log(index);
    if (image.serverFilePath !== undefined && image.serverFilePath !== null) {
      this.selectedImageIndex = image.serverFilePath;
      this.selectedImageUrl = image?.serverFilePath;
      this.selectedExistingImage = image;
      let imageTitle = image?.title;
      this.uploadContentImageForm.controls["existingSelectedImage"].setValue(this.selectedImageUrl);
      this.uploadContentImageForm.controls["textValueName"].setValue(imageTitle);
      this.uploadContentImageForm.controls["alternateTextValue"].setValue(imageTitle);
      this.uploadContentImageForm.controls["textValueName"].markAsTouched();
      this.uploadContentImageForm.controls["existingSelectedImage"].markAsTouched();

    }

  }

  /* istanbul ignore next */
  searchFiles() {
    if (this.searchTerm === "") {
      this.images = [];
      this.images = this.imagesCopy;
      this.isVisibleImage = true;
      this.filteredFiles = [];
    } else {
      this.images = [];
      this.filteredFiles = [];
      // this.isVisibleImage = false;
      for (let i = 0; i < this.imagesCopy.length; i++) {
        if (this.imagesCopy[i].filename === this.searchTerm) {
          this.images.push(this.imagesCopy[i]);
        }
      }
    }
  }

  /* istanbul ignore next */
  clearImageSearch() {
    this.images = [];
    this.images = this.imagesCopy;
    this.isVisibleImage = true;
    this.searchTerm = "";
    this.filteredFiles = [];
    this.showClearImageSearch = false;
    this.existinguploadedImages = this.defaultexistinguploadedImages;
  }

  getNameCharLength() {
    this.imageNamePendingLength = this.imageNameMaxLength - this.textValueName.length;
    // console.log(this.imageNamePendingLength);
    this.note = "(" + this.imageNamePendingLength + " characters remaining)";
  }

  getAlternateTextLenth() {
    this.alternateTextpendingLength = 200 - this.alternateTextValue.length;
    this.note1 = "(" + this.alternateTextpendingLength + " characters remaining)";
  }

  closeDialog() {
    this.uploadContentImageForm.markAsUntouched();
    this.showImageUploadDialog = false;
    this.uploadContentImageForm.reset();

  }
  onBeforeDialogHide() {
    this.uploadContentImageForm.markAsUntouched();
    this.showImageUploadDialog = false;
    this.uploadContentImageForm.reset();
  }
  /* istanbul ignore next */
  getSelectedPopulation(population) {
    this.defaultPopulation = population;
    /*** Add select text logic  */
    const selObj = window.getSelection();
    this.cursorPosition = this.getCursorPosition();
    let range1;
    /* istanbul ignore next */
    let parentElement = null;
    /* istanbul ignore next */
    parentElement = this.editorEvent.model.document.selection.getFirstPosition().parent;
    this.editorEvent.model.schema.extend("paragraph", {
      allowAttributes: "id"
    });
    if (selObj.toString() === "") {
      if (this.editorEvent.model !== undefined) {
        const selection = this.editorEvent.model.document.selection;
        const range = selection.getFirstRange();
        // Get the position of the cursor within the range
        const cursorPosition = range ? range.start.offset : null;
        this.indexselectedText = cursorPosition;
        /* istanbul ignore next */
        if (cursorPosition !== null) {
          const docFrag = this.editorEvent.model.change( writer => {
            const start = writer.createElement( "populationStart" );
            const para = writer.createElement( "innerTextPop" );
            const end = writer.createElement( "populationEnd" );
            const para1 = writer.createElement( "paragraph" );
            // const jada = writer.createElement( 'jaideep' );
            const docFragment = writer.createDocumentFragment();
            // const command =  this.editorEvent.execute( 'fontColor', { value: 'green' } );
            let src = "[BEGIN "+ this.defaultPopulation + "]" + this.selectedText + "[END "+ this.defaultPopulation + "]";
              writer.append( start, docFragment );
              writer.append( para, docFragment );
              writer.append( end, docFragment );
              writer.insertText( " [BEGIN "+ this.defaultPopulation + "]", start);
              writer.insertText( " " + this.selectedText + " ", para);
              writer.insertText( "[END "+this.defaultPopulation+"] ", end );
              return docFragment;
            } );
            // this.editorEvent.model.insertContent( docFrag , range.end);
            // this.editorEvent.model.insertContent( "" , range.end);
            let source = "<p contenteditable=\"true\"><span style =\"color: green;\" contenteditable=\"false\" id =\"populationStart\">[BEGIN "+ this.defaultPopulation +"]</span> <span style=\"color: green;\" contenteditable=\"false\" id =\"populationEnd\">[END "+ this.defaultPopulation + "]</span>&nbsp;</p>";
            if (this.editorEvent.model !== undefined) {
              this.editorEvent.model.change(writer => {
                const htmlDP = this.editorEvent.data.processor;
                const viewFragment = htmlDP.toView(source);
                const modelFragment = this.editorEvent.data.toModel(viewFragment);
                this.editorEvent.model.insertContent(modelFragment, this.editorEvent.model.document.selection);
              });
            }
        }

      }
    } else {
      if (!this.removeFlagBydblClick) {
        this.selectedText = selObj.toString();
      }
      // this.indexselectedText = this.editorInstacnce.getData().search(this.selectedText);
      const selection = this.editorEvent.model.document.selection;
      range1 = selection.getFirstRange();
      // Get the position of the cursor within the range
      const cursorPosition = range1 ? range1.start.offset : null;
      // console.log('Cursor position:', cursorPosition);
      // let source = "<populationstart> [BEGIN "+ this.defaultPopulation + "]</populationstart><innertextpop> " + this.selectedText + " </innertextpop><populationend>[END "+ this.defaultPopulation + "] </populationend>";
      let source = "<p contenteditable=\"true\"><span style =\"color: green;\" contenteditable=\"false\" id =\"populationStart\">[BEGIN "+ this.defaultPopulation +"]</span> "+ this.selectedText +" <span style=\"color: green;\" contenteditable=\"false\" id =\"populationEnd\">[END "+ this.defaultPopulation + "]</span>&nbsp;</p>";
      /* istanbul ignore next */
      if (cursorPosition !== null) {
        const docFrag = this.editorEvent.model.change( writer => {
          const start = writer.createElement( "populationStart" );
          const para = writer.createElement( "innerTextPop" );
          const end = writer.createElement( "populationEnd" );
          const para1 = writer.createElement( "paragraph" );
          // const jada = writer.createElement( 'jaideep' );
          const docFragment = writer.createDocumentFragment();
          // const command =  this.editorEvent.execute( 'fontColor', { value: 'green' } );
            writer.append( start, docFragment );
						writer.append( para, docFragment );
						writer.append( end, docFragment );
						writer.insertText( " [BEGIN "+ this.defaultPopulation + "]", start);
            writer.insertText( " " + this.selectedText + " ", para);
            writer.insertText( "[END "+this.defaultPopulation+"] ", end );
            // writer.setAttribute("id", this.defaultPopulation, start);
            // writer.setAttribute("id", this.defaultPopulation, para);
            // writer.setAttribute("id", this.defaultPopulation, end);
            return docFragment;
          } );
          this.editorEvent.model.change(writer => {
            writer.remove(writer.createRange(this.cursorRange.start, this.cursorRange.end));
          });
          console.log("doc ", docFrag, " ==> range ", range1.start);
          // this.editorEvent.model.insertContent( docFrag, range1.start);
          // this.editorEvent.model.insertContent( "" , range1.end);
          
          // adding unsafe attribute in tags and not render the content 
          if(this.editorEvent.model !== undefined) {
            this.editorEvent.model.change(writer => {
              const htmlDP = this.editorEvent.data.processor;
              const viewFragment = htmlDP.toView(source);
              const modelFragment = this.editorEvent.data.toModel(viewFragment);
              this.editorEvent.model.insertContent(modelFragment, this.editorEvent.model.document.selection);
            });
          }
      }
      
    }
    // console.log(this.defaultPopulation, "selectedpop");
    // this.formEditorData = this.formEditorData + " " + " <h3 class=\"pop-class"+"style=\"color: green;\" > <b>[BEGIN " + this.defaultPopulation + "] [END " + this.defaultPopulation + "] </b></h3>";
    this.populationsDialog = false;
    this.removeFlagBydblClick = false;
    this.nodeValuefromDobleClick = "";
    this.defaultPopulation = "";
    this.selectedPopulation = "";
    this.selectedText = "";

  }

  getClosepulation(status) {
    this.populationsDialog = false;
    this.defaultPopulation = "";
    this.selectedPopulation = "";
  }
  populationMethod() {
    this.selectedPopulation = "";
    this.populationsDialog = true;
  }
  /* istanbul ignore next */
  insertImageIntoEditor(imgPath, imgTitle) {
    let altArr = []; /* need to push 
    0. will push selected image index
    1. image width
    2. image wrap dont/ wrap
    3. alignment
    4. alt tag
    
    */
    let alignment = null;
    let textWrap = "inline";
    let title = imgTitle;
    if (this.uploadContentImageForm.controls["alignment"].value !== undefined) {
      alignment = this.uploadContentImageForm.controls["alignment"].value.toLowerCase();
    }
    if (this.uploadContentImageForm.controls["textWrap"].value === "block") {
      textWrap = "block";
    } else {
      textWrap = "inline";
    }

    let width = this.uploadContentImageForm.controls["withforCrop"].value;
    let altTag = this.uploadContentImageForm.controls["alternateTextValue"].value;
    // altArr.push(this.selectedImageIndex);
    altArr.push(altTag);
    altArr.push(textWrap);
    altArr.push(alignment);
    altArr.push(width);

    let source = "";

    if (this.replaceImage) {
      this.editorEvent.model.change(writer => {
        writer.remove(writer.createRange(this.cursorRange.start, this.cursorRange.end));
      });
    }

    if(textWrap === "block"){
      if (alignment !== "right") {
        source = `<span style="width:${width}%; float:left;margin:11px" contenteditable="false">
      <img src="${imgPath}" alt="${altArr.toString()}" srcset="${imgPath}" align="${alignment}" title="${title}" style="width:100%; height:auto"  />
      </span><p><br />&nbsp;</p>`;
      } else {
        source = `<span style="width:${width}%; float:right;margin:11px" contenteditable="false;">
    <img src="${imgPath}" alt="${altArr.toString()}" srcset="${imgPath}" align="${alignment}" title="${title}"  style="width:100%; height:auto"  />
    </span><p><br />&nbsp;</p>`;
      }
    }
    if(textWrap === "inline"){
      if (alignment !== "right") {
        let marginRight =100-width;
        let inlineStyle = "width: "+width+"%; float: left; margin: 11px "+marginRight+"% 11px 11px;";
        
        source = `<span style="${inlineStyle}" contenteditable="false">
      <img src="${imgPath}" alt="${altArr.toString()}" srcset="${imgPath}" align="${alignment}" title="${title}" style="width:100%; height:auto"  />
      </span><p><br />&nbsp;</p>`;
      } else {
        let marginLeft =100-width;
        let inlineStyle = "width: "+width+"%; float: right; margin: 11px 11px 11px "+marginLeft+"%";
        source = `<span style="${inlineStyle}" contenteditable="false">
    <img src="${imgPath}" alt="${altArr.toString()}" srcset="${imgPath}" align="${alignment}" title="${title}" style="width:100%; height:auto" />
    </span><p><br />&nbsp;</p>`;
      }
    }
    if (this.editorEvent !== undefined && this.editorEvent.model !== undefined) {
      this.editorEvent.model.change(writer => {
        const htmlDP = this.editorEvent.data.processor;
        const viewFragment = htmlDP.toView(source);
        const modelFragment = this.editorEvent.data.toModel(viewFragment);
        this.editorEvent.model.insertContent(modelFragment, this.editorEvent.model.document.selection);
      });
    } else {
      this.formEditorData = this.formEditorData + source;
    }

  }



  // altArr.join("")
  // let source = `<img src="${imgPath}"
  // alt="${altTag}" title="${title}" data-pgno="1" data-srchkey=""
  // data-radio="${textWrap}" style="width: ${width}%; float: ${alignment}; margin: 11px;">&ZeroWidthSpace;`; 

  /* istanbul ignore next */


  //  this.Editor.execute( 'insertImage', {
  //   source:  [
  //     { src: this.selectedImageUrl,alt: 'Second alt text', customAttribute: 'My attribute value' },
  //     // { src: 'path/to/other-image.jpg', alt: 'Second alt text', customAttribute: 'My attribute value' }
  //   ]
  // } );
  // if (this.editorEvent.model !== undefined) {
  // const textToChange = this.editorEvent.model.change(writer => {

  //     const textToInsertData = this.editorEvent.model.change(writer => {

  //         const emptyElement = writer.createEmptyElement( 'img' );
  //       const figure = writer.createContainerElement( 'figure', { class: 'image' } );

  //       writer.insert( writer.createPositionAt( figure, 0 ), emptyElement );
  //             });

  //   });
  // }





  //  let imageClass = ""
  // if(alignment !=="right"){
  //   imageClass ="image ck-widget ck-widget_with-resizer image-style-align-left ck-widget_selected";
  // }
  // else {
  // imageClass ="image ck-widget ck-widget_with-resizer image-style-align-right ck-widget_selected"
  // }
  // source = `<p><figure style="width:${width}%" class="${imageClass}" contenteditable="false">
  // <img src="${imgPath}" alt="${altArr.toString()}" align="${alignment}" title="${title}"width="${width}%" />
  // </figure></p>`;






  // source = "<p></p>";
  // if (this.editorEvent !==undefined && this.editorEvent.model !== undefined) {
  // this.editorEvent.model.change( writer => {
  // const imageElement = writer.createElement("imageInline", { // imageBlock  imageInline
  //       src: imgPath,
  //       alt: altArr.toString(),
  //       align: alignment,
  //       width: width+"%",
  //       title: title,
  //       imageStyle:"side"
  // });
  // console.log(writer);
  // this.editorEvent.model.insertContent(imageElement, this.editorEvent.model.document.selection);
  // } );
  // } else{
  //   source = `<p><span class="image-inline ck-widget ck-widget_with-resizer" contenteditable="false">
  //   <img src="${imgPath}" alt="${altArr.toString()}" align="${alignment}" title="${title}"width="${width}%" />
  //   </span></p>`;
  //   this.formEditorData = this.formEditorData + source;
  // }

  // }else {
  //   source = `
  //   <p><figure style="width:${width}%" class="image ck-widget image-style-block-align-right openImagePopup_for_replace" contenteditable="false">
  // <img src="${imgPath}" alt="${altArr.toString()}" align="${alignment}" title="${title}"width="${width}%"  />
  // </figure></p>
  //   `;
  //   if (this.editorEvent !==undefined && this.editorEvent.model !== undefined) {
  //     this.editorEvent.model.change( writer => {

  //       const htmlString = '<p><b>Test</b> Content</p>';
  // 		const htmlDP = this.editorEvent.data.processor;
  // 		const viewFragment = htmlDP.toView( htmlString );

  // 		const modelFragment = this.editorEvent.data.toModel( viewFragment );

  // 		this.editorEvent.model.insertContent( modelFragment, this.editorEvent.model.document.selection );
  //   } );
  // } else{

  //   this.formEditorData = this.formEditorData + source;
  // }

  // writer.insertContent(source, this.editorEvent.model.document.selection.getFirstPosition().parent)
  // const imageElement = writer.createElement("imageBlock", { // imageBlock  imageInline
  //       src: imgPath,
  //       alt: altArr.toString(),
  //       align: alignment,
  //       width: width+"%",
  //       title: title,
  //       classList:"image-style-block-align-right"
  // });
  // console.log(writer);

  // this.editorEvent.model.insertContent(imageElement, this.editorEvent.model.document.selection);
  // this.editorEvent.model.schema.extend("imageBlock", {
  //   allowAttributes: "class"
  // });
  // writer.setAttribute("class", "image-style-block-align-right", this.editorEvent.model.document.selection.getFirstPosition().parent);

  // } );
  // } else{

  //   this.formEditorData = this.formEditorData + source;
  // }


  ////}


  //}
  /* istanbul ignore next */

  //   onContinueToUploadImageReplace(){
  //     this.uploadContentImageForm.get("uploadedImageForEditor").setValidators(null); 
  //     this.uploadContentImageForm.get("uploadedImageForEditor").setErrors(null); 
  //     this.uploadContentImageForm.controls["existingSelectedImage"].setValidators([Validators.required]);
  //     if (this.uploadContentImageForm.valid) {
  //       if (this.existingImageDialog) {this.closeDialog(); }  
  //   }
  // }

  /* replaceImageIntoEditor(imgPath, imgTitle) {
    let altArr = []; 
  
    let alignment = null;
    let textWrap = "inline";
    let title = imgTitle;
    if (this.uploadContentImageForm.controls["alignment"].value !== undefined) {
      alignment = this.uploadContentImageForm.controls["alignment"].value.toLowerCase();
    }
    if (this.uploadContentImageForm.controls["textWrap"].value === "block") {
      textWrap = "block";
    } else {
      textWrap = "inline";
    }
   
    let width = this.uploadContentImageForm.controls["withforCrop"].value;
    let altTag = this.uploadContentImageForm.controls["alternateTextValue"].value;
    altArr.push(this.selectedImageIndex);
    altArr.push(width);
    altArr.push(textWrap);
    altArr.push(alignment);
    altArr.push(altTag);
   
  
    let source = "";
  
  if(alignment !=="right"){
  
  source =`<p id="test><span style="width:${width}%" class="image-inline ck-widget image_resized ck-widget_selected ck-widget_with-resizer 
  " contenteditable="false;">
  <img src="${imgPath}" alt="${altArr.toString()}" align="${alignment}" title="${title}" width="${width}%"  />
  </span></p>`;
  ;
  }else {
  source = `<p><figure style="width:${width}%" class="image ck-widget image-style-block-align-right openImagePopup_for_replace" contenteditable="false">
  <img src="${imgPath}" alt="${altArr.toString()}" align="${alignment}" title="${title}"width="${width}%"  />
  </figure></p>`;
  }
  
    this.formEditorData = this.formEditorData + source;
    console.log(source);
  } */

  onContinueToUploadImage() {
    const data = this.uploadContentImageForm.value;
    if (this.existingImageDialog) {
      this.uploadContentImageForm.get("uploadedImageForEditor").setValidators(null);
      this.uploadContentImageForm.get("uploadedImageForEditor").setErrors(null);
      this.uploadContentImageForm.controls["existingSelectedImage"].setValidators([Validators.required]);
    } else {
      this.uploadContentImageForm.controls["uploadedImageForEditor"].setValidators([Validators.required]);
      this.uploadContentImageForm.get("existingSelectedImage").setValidators(null);
      this.uploadContentImageForm.get("existingSelectedImage").setErrors(null);
    }
    /* istanbul ignore next */
    if (this.uploadContentImageForm.valid) {
      /* istanbul ignore next */
      if (this.existingImageDialog) {
        this.insertImageIntoEditor(this.selectedImageUrl, this.selectedExistingImage.title);
        this.closeDialog();
      } else {
        this.uploadButtonDisabled = true;
        const dataToUpload = {
          "folderPath": "UCEDocuments/CONTENTPAGE_IMAGES",
          "documentTitle": data.textValueName,
          "fileId": this.contentIDGenerator(),
          "attachmentMimeType": this.attachmentImageMimeType,
          "attachmentFileName": this.attachmentImageFileName,
          "attachmentFileExtension": this.attachmentImageExtension,
          "attachmentFileStream": this.imageFileStreamData,
          "aonExpression": "All_Authenticated_Users",
          "documentLanguage": "en_US",
          "lastUpdated": Date.now().toString(),
          "updatedBy": this.userEmail,
          "documentDescription": data.textValueName,
          "searchTags": "",
          "categories": "",
          "includeInContentLibrary": false,
          "upointLink": false,
          "topSearchResult": false,
          "searchable": true,
          "usage": "test",

          "alignment": data.alignment,
          "alternateTextValue": data.alternateTextValue,
          "textValueName": data.textValueName,
          "textWrap": data.textWrap,
          "withforCrop": data.withforCrop
        };

        this.documentService.uploadImageFile(dataToUpload).subscribe({
          /* istanbul ignore next */
          next: (result: any) => {
            console.log(result, "result");
            this.uploadButtonDisabled = false;
            this.messageService.clear();
            this.messageService.add({ severity: "success", summary: result.responseStatus, detail: "Document uploaded successfully!" });
            const ImagePath = result.serverFilePath;
            this.getExistingUploadedImages();
            this.insertImageIntoEditor(ImagePath, dataToUpload.documentTitle);
            this.closeDialog();
          },
          /* istanbul ignore next */
          error: (error) => {
            console.log(error.error);
            this.uploadButtonDisabled = false;
            let err = error.error;
            this.messageService.add({ severity: "error", summary: err.responseStatus, detail: err.responseMessage });
          }
        });
      }


    } else {
      this.uploadContentImageForm.markAllAsTouched();
      // console.log(this.uploadContentImageForm.controls)
    }


  }
  /* istanbul ignore next */
  onContinue() {
    if (this.existingImageDialog) {
      const imgPath = this.selectedImageUrl;
      let source = "<img src=" + imgPath + " " + "height=\"125px\"" + "/>";
      this.formEditorData = this.formEditorData + source;
      console.log(this.formEditorData);
      this.closeDialog();
    } else {
      this.closeDialog();
    }
  }
  // Validation Check

  /* istanbul ignore next */
  isDocFieldValid(field: string) {
    if (field !== undefined && field !== null) {
      return this.uploadDocumentForm.controls[field].invalid && this.uploadDocumentForm.controls[field].touched;
    }
  }

  /* istanbul ignore next */
  isDocFieldValidForImage(field: string) {
    if (field !== undefined && field !== null) {
      return this.uploadContentImageForm.controls[field].invalid && this.uploadContentImageForm.controls[field].touched;
    }
  }
  /* istanbul ignore next */
  handleUploadedImageFile(event) {
    //   let uploadedFile = event.target.files[0];
    // this.convertOmageToStreamData(event.target.files[0]).subscribe( streamData =>{
    //     console.log(streamData);
    //     this.imageFileStreamData = streamData;
    let uploadedFile = event.target.files[0];
    let fileData = uploadedFile.arrayBuffer();
    fileData.then(data => {
      let btdata = new Uint8Array(data);
      let array = Array.from(btdata);
      console.log(array);
      this.imageFileStreamData = array;
    }).catch((error) => {
      console.log(error);
    });

    // const reader = new FileReader();
    // reader.addEventListener('load', (event) => {
    //   const result = event.target.result;
    //   // this.imageFileStreamData = result
    //   // console.log(result)
    //   // Do something with result
    // });
    // reader.addEventListener('progress', (event) => {
    //   if (event.loaded && event.total) {
    //     const percent = (event.loaded / event.total) * 100;
    //     // console.log(`Progress: ${Math.round(percent)}`);
    //   }
    // });
    // reader.readAsDataURL(uploadedFile);

    // console.log(uploadedFile)
    let fileSize = uploadedFile.size;
    let fileName = uploadedFile.name;
    this.attachmentImageExtension = fileName.split(".").pop();
    if (!(this.acceptedImagesType.includes(this.attachmentImageExtension)) || fileSize > this.maxUploadedImageSize) {
      this.invalidImageFile = true;
      this.uploadContentImageForm.controls["uploadedImageForEditor"].setValue(null);
    } else {
      this.attachmentImageFileName = uploadedFile.name.split(".")[0];
      this.attachmentImageFileName = uploadedFile.name.split(".").pop().toLowerCase();
      this.attachmentImageMimeType = uploadedFile.type;
      const size = uploadedFile.size;
      this.invalidImageFile = false;
    }
  }
  /* istanbul ignore next */
  uploadContentImage() {

  }
  /* istanbul ignore next */
  validateNo(e): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    if (this.uploadContentImageForm.controls["withforCrop"].value > 100) {
      this.uploadContentImageForm.controls["withforCrop"].setValue("100");
    }
    return true;
  }
  /* istanbul ignore next */
  convertOmageToStreamData(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    // console.log(reader.readAsArrayBuffer(file));
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    console.log(result);
    return result;
  }
  /* istanbul ignore next */
  getExistingUploadedImages() {


    this.contentService.getExistingUploadedImages().subscribe({
      next: (ImagesData) => {
        this.existingImagesLoader = false;
        this.existinguploadedImages = ImagesData?.documentList;
        this.defaultexistinguploadedImages = ImagesData?.documentList;
        let dataSorted = this.defaultexistinguploadedImages.sort(function (a, b) {
          return (b.lastUpdated > a.lastUpdated) ? 1 : ((a.lastUpdated > b.lastUpdated) ? -1 : 0);
        });
        this.existinguploadedImages = dataSorted;
      },
      error: (error) => {
        this.existingImagesLoader = false;
        console.log(error.error);
      }
    });

    // this.contentService.getExistingUploadedImages().subscribe( ImagesData=>{
    //   console.log(ImagesData);
    //   this.existinguploadedImages = ImagesData?.documentList;
    //   this.defaultexistinguploadedImages =ImagesData?.documentList;
    // } ),
    // (error)=>{
    //   console.log(error.error);
    // };
  }
  /* istanbul ignore next */
  SearchImageByTitle() {
    console.log(this.searchTerm);
    let topSearchResult = [];
    if (this.defaultexistinguploadedImages && this.defaultexistinguploadedImages.length > 0 && this.searchTerm) {
      this.defaultexistinguploadedImages.filter(image => {
        console.log(image.title, "---", image.fileName, this.searchTerm);
        if (image.title && image.title.toLowerCase().includes(this.searchTerm.toLowerCase())) {
          topSearchResult.push(image);
        }
      });
    }
    this.showClearImageSearch = true;
    this.existinguploadedImages = topSearchResult;
  }
  /* istanbul ignore next */
  onAfterHideCheck() {

  }
  /* istanbul ignore next */
  closeAlertDialog() {
    this.showAlertDialog = false;
  }

  /* istanbul ignore next */
  isNumberKey(evt) {
    let charCode = (evt.which) ? evt.which : evt.keyCode;
    console.log(evt.target.value);
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

/* istanbul ignore next */
  cancelExistingDocumentDialog() {
    this.documentDialog = false;
     this.newDocumentFlag = false;
    this.selectedFileTitle = null;
    this.removeFlagBydblClick = false;
    }
/* istanbul ignore next */
    cancelPredefinedDialog() {
      this.ssoDialog = false;
      this.selectedPredefinedList = null;
      this.removeFlagBydblClick = false;
      }

  /* istanbul ignore next */
  cancelExternalSiteDialog() {
    this.publicUrl = "";
    this.organizationName = "";
    this.publicUrlError = false;
    this.publicDialog = false;
    this.intranet = false;
    this.removeFlagBydblClick = false;
  }
  /* istanbul ignore next */
      insertSectionIntoEditor(){
        let countSection = 1;
        let sectionId = "section_generated_"+countSection;
        let source = `
        <section class="toggle-container">
            <div class="title">
            <label class="toggle-title"> 
            <span id="${sectionId}" style="cursor:pointer; font-weight:700;" onclick="window.panelOnClickSectionTab(${sectionId})">+ Title</span>
            
            </label>
            </div>
            <div class="panel_content_hide">
                Your content goes here.
            </div>
        </section>`;
          /* istanbul ignore next */
        return source;
      }
/* istanbul ignore next */
copyUsingEditor() {
  console.log("in copyUsingEditor1");
  this.getSelectedTextHTML();
}
/* istanbul ignore next */
getSelectedTextHTML() {
  this.selectedHTML = "";
  let selection = window.getSelection();
  console.log("selection.getRangeAt(0) ", selection.getRangeAt(0), " ==> ",selection)
  if (selection.rangeCount > 0) {
    let range = selection.getRangeAt(0);
    // let clonedRange = range.cloneContents();
    // let div = document.createElement("div");
    // div.appendChild(clonedRange);
    var div = document.createElement('div');
    div.appendChild(range.cloneContents());
    console.log( " div ", div , " inner ", div.innerHTML);
    this.selectedHTML = div.innerHTML;
    console.log("Selected HTML:", this.selectedHTML);
  } else {
    console.log("No text selected.");
  }
  // window.getSelection().empty();
}
/* istanbul ignore next */
pasteHTML() {
  let classCheck = "ck-widget image_resized ck-widget_with-resizer ck-widget_selected";
  /* if (this.currentEle) {
    return
  } */
  this.checkForTheImageStyle();
  if (this.editorEvent.model !== undefined) {
    this.editorEvent.model.change(writer => {
      const htmlDP = this.editorEvent.data.processor;
      const viewFragment = htmlDP.toView(this.selectedHTML);
      const modelFragment = this.editorEvent.data.toModel(viewFragment);
      this.editorEvent.model.insertContent(modelFragment, this.editorEvent.model.document.selection);
    });
  }
  let replaceCheck = " ";
  let index = this.formEditorData.search(classCheck);
  // console.log("index", index);
  if (index >= 0) {
    // this.formEditorData = this.formEditorData.replace( classCheck, replaceCheck)
  }
  // console.log("form data ", this.formEditorData);
}

// Attach the function to a suitable event, for example, a button click
// document.getElementById('editableDiv').addEventListener('mouseup', getSelectedTextHTML);
      /* istanbul ignore next */
      returnLanguageName( code ){
       return this.contentService.returnLanguageNameFromCode(this.languagesList, code);
      }
  /* istanbul ignore next */
  checkForTheImageStyle() {
    let testString ="<p>tesg</p><p><span style=\"float:left;margin:11px 80% 11px 11px;width:20%;\" contenteditable=\"false\"><span class=\"image-inline ck-widget image_resized ck-widget_with-resizer ck-widget_selected\" style=\"width:100%;\" contenteditable=\"false\" align=\"left\" title=\"new image mar1\">";
    let classCheck = "ck-widget image_resized ck-widget_with-resizer ck-widget_selected";
    let tableString = "<figure class=\"table ck-widget ck-widget_with-selection-handle ck-widget_selected\" contenteditable=\"false\">";
    let tableReplaceString ="<figure class=\"table\" contenteditable=\"false\">";
    let splitData = this.selectedHTML.split("<img");
    // console.log("splitData ", splitData);
    for (let i =0; i<splitData.length; i++) {
      let data = splitData[i].toString();
      let searchIndex = -1;
      let left = "<span style=\"float:left;\"";//<span style="float:left
     
      searchIndex =  data.search("<span style=\"float:left");
      //style="float:left;margin:11px;width:45%;"
      // console.log("search index ", searchIndex)
      //<span style="float:left;margin:11px;width:20%;" contenteditable="false">
      if (searchIndex >= 0) {
        let len = "<span style=\"float:left;margin:11px ";//style="float:left;margin:11px;width:20%;"
        let cssLeft = "<span class=\"image-inline ck-widget image_resized ck-widget_with-resizer ck-widget_selected\" style=\"width:100%;\"";
        let width = splitData[i].slice(searchIndex+len.length, searchIndex+len.length+2);
        console.log("margin ", width );
        let marginRight = 100 - parseInt(width, 10);
        /** Image with wrap text */
        if (Number.isNaN(marginRight)) {
          let len1 = "<span style=\"float:left;margin:11px;width:";
          width = splitData[i].slice(searchIndex+len1.length, searchIndex+len1.length+2);
          marginRight = parseInt(width, 10);
        }
        let replaceString = `<span class="image-inline" style="width:${marginRight}%;"`;
        this.selectedHTML= this.selectedHTML.replace(cssLeft, replaceString);

      } else {
        let cssRight = "<span class=\"image-inline ck-widget image_resized ck-widget_with-resizer ck-widget_selected\" style=\"width:100%;\"";
        searchIndex =  data.search("<span style=\"float:right");
        // console.log("search index in else ", searchIndex, " => cond ",data.search("<span style=\"float:right"));
        //float:right;margin:11px;width:10%;
        if (searchIndex >= 0) {
          let right = "<span style=\"float:right;margin:11px 11px 11px ";
          let width = splitData[i].slice(searchIndex+right.length, searchIndex+right.length+2);
          let marginRight = 100 - parseInt(width, 10);
          console.log("margin ", width );
          /** Image with wrap text */
          if (Number.isNaN(marginRight)) {
            let len1 = "<span style=\"float:right;margin:11px;width:";
            width = splitData[i].slice(searchIndex+len1.length, searchIndex+len1.length+2);
            marginRight = parseInt(width, 10);
          }
          let replaceString = `<span class="image-inline" style="width:${marginRight}%;"`;
          this.selectedHTML= this.selectedHTML.replace(cssRight, replaceString);
        }
      }
      this.selectedHTML = this.selectedHTML.replace(tableString, tableReplaceString);
    }
  }
  /* istanbul ignore next */
  readyEditorEvent(event) {
    // console.log("readyEditorEvent", event);
    this.editorEvent = event;
  }
  /* istanbul ignore next */
  getSelectedTextHTMLForLink() {
    let selectedHTML = "";
    let selection = window.getSelection();

    if (selection.rangeCount > 0) {
      let range = selection.getRangeAt(0);
      let clonedRange = range.cloneContents();
      let div = document.createElement("div");
      div.appendChild(clonedRange);

      selectedHTML = div.innerHTML;
      console.log("Selected HTML:", selectedHTML);
      let bold = selectedHTML.search("<strong>");
      if (bold >= 0) {
        this.boldFlag = true;
      }
      let italic = selectedHTML.search("<i>");
      if (italic >= 0) {
        this.italicFlag = true;
      }
      console.log("flag :", bold, italic, this.boldFlag, this.italicFlag);
    } else {
      console.log("No text selected.");
    }
    // window.getSelection().empty();
  }
  /* istanbul ignore next */
  getSelectedTextHTMLForPop() {
    let selectedHTML = "";
    let selection = window.getSelection();

    if (selection.rangeCount > 0) {
      let range = selection.getRangeAt(0);
      let clonedRange = range.cloneContents();
      let div = document.createElement("div");
      div.appendChild(clonedRange);

      selectedHTML = div.innerHTML;

      console.log("Selected HTML:", selectedHTML);
    } else {
      console.log("No text selected.");
    }
    // window.getSelection().empty();
  }
  /* istanbul ignore next */
  getLinkRange() {
    // console.log("getLinkRange ");
    const editor = this.editorEvent;
    let parentElement = this.editorEvent.model.document.selection.getFirstPosition().parent;
    const selection = this.editorEvent.model.document.selection;
    this.cursorRange = selection.getFirstRange();
    let range = { start: 0, end: 0 };
    for (let i = 0; i < parentElement.childCount; i++) {
      let children = parentElement.getChild(i);
      // console.log("parentElement ", parentElement, " range ", this.editorEvent.model.document.selection.getFirstPosition())
      // console.log("children ", children)
      if (children.getAttribute("linkHref") === this.nodeValuefromDobleClick) {
        // console.log("children index ", children.index)
        let index = children.index - 1;
        // console.log("index ", index)
        // const startPosition = editor.model.createPositionAt(editor.model.document.getRoot(), [0, ...editor.model.document.selection.getFirstPosition().path], children.startOffset);
        // const endPosition = editor.model.createPositionAt(editor.model.document.getRoot(), [0, ...editor.model.document.selection.getFirstPosition().path], children.endOffset);
        range.start = (children.startOffset);
        range.end = (children.endOffset);
        console.log("range in if ", range);
        // this.cursorRange.start.path[0] = index;
        this.cursorRange.start.path[1] = children.startOffset;
        // this.cursorRange.end.path[0] = index;
        this.cursorRange.end.path[1] = children.endOffset;
        console.log("cursorRange  ", this.cursorRange);
      }
    }

    return range;
  }
}
