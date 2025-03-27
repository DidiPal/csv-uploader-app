import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CsvUploaderService } from '../services/csv-uploader.service';

@Component({
  selector: 'app-csv-uploader',
  templateUrl: './csv-uploader.component.html',
  styleUrls: ['./csv-uploader.component.scss']
})
export class CsvUploaderComponent implements OnInit {
  currentStep = 1;
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  selectedTable: string = '';
  tables = [
    { id: 'products', name: 'Catalogo prodotti' },
    { id: 'customers', name: 'Anagrafica clienti' },
    { id: 'suppliers', name: 'Fornitori' },
    { id: 'categories', name: 'Categorie' }
  ];
  importTypes = [
    { id: 'update', name: 'Aggiornamento (Update or append)' },
    { id: 'replace', name: 'Sostituzione (Delete and Create)' }
  ];
  selectedImportType: string = 'update';
  validationResults: any = null;
  importResults: any = null;
  isLoading = false;
  isFileTypeError = false;
  showAdvancedOptions = false;
  
  // Opzioni avanzate
  advancedOptions: {
    skipHeader: boolean;
    strictValidation: boolean;
    sendNotification: boolean;
    delimiter: string;
    encoding: string;
    [key: string]: any;  // Aggiunta questa riga
  } = {
    skipHeader: true,
    strictValidation: false,
    sendNotification: false,
    delimiter: ',',
    encoding: 'UTF-8'
  };
  
  // Mappatura colonne (simulata - in produzione verrebbe caricata dal server)
  columnMappings = [
    { csvColumn: 'id', dbField: 'id' },
    { csvColumn: 'nome', dbField: 'name' },
    { csvColumn: 'descrizione', dbField: 'description' },
    { csvColumn: 'prezzo', dbField: 'price' },
    { csvColumn: 'categoria', dbField: 'category_id' },
    { csvColumn: 'sku', dbField: 'sku' },
    { csvColumn: 'quantita', dbField: 'quantity' }
  ];
  
  // Campi disponibili nel DB (simulati)
  availableDbFields = [
    { id: 'id', name: 'ID' },
    { id: 'name', name: 'Nome' },
    { id: 'description', name: 'Descrizione' },
    { id: 'price', name: 'Prezzo' },
    { id: 'category_id', name: 'Categoria' },
    { id: 'sku', name: 'SKU' },
    { id: 'quantity', name: 'Quantità' },
    { id: 'created_at', name: 'Data creazione' },
    { id: 'updated_at', name: 'Data aggiornamento' },
    { id: 'is_active', name: 'Attivo' }
  ];
  
  // Campi obbligatori
  requiredFields = ['name', 'price', 'sku'];
  
  constructor(
    private fb: FormBuilder,
    private csvService: CsvUploaderService
  ) {
    this.uploadForm = this.fb.group({
      table: ['', Validators.required],
      importType: ['update', Validators.required],
      file: [null, Validators.required]
    });
  }

  ngOnInit(): void {}

  onTableSelect(tableId: string): void {
    this.selectedTable = tableId;
    this.uploadForm.get('table')?.setValue(tableId);
    
    // In un'app reale qui si aggiornerebbero i campi disponibili e le mappature colonne
    // in base alla tabella selezionata
    this.updateColumnMappings(tableId);
  }

  updateColumnMappings(tableId: string): void {
    // Simulazione: cambia le mappature in base alla tabella selezionata
    if (tableId === 'customers') {
      this.columnMappings = [
        { csvColumn: 'id', dbField: 'id' },
        { csvColumn: 'nome', dbField: 'first_name' },
        { csvColumn: 'cognome', dbField: 'last_name' },
        { csvColumn: 'email', dbField: 'email' },
        { csvColumn: 'telefono', dbField: 'phone' },
        { csvColumn: 'codice_fiscale', dbField: 'tax_code' },
        { csvColumn: 'indirizzo', dbField: 'address' }
      ];
      
      this.requiredFields = ['first_name', 'last_name', 'email'];
    } else if (tableId === 'products') {
      this.columnMappings = [
        { csvColumn: 'id', dbField: 'id' },
        { csvColumn: 'nome', dbField: 'name' },
        { csvColumn: 'descrizione', dbField: 'description' },
        { csvColumn: 'prezzo', dbField: 'price' },
        { csvColumn: 'categoria', dbField: 'category_id' },
        { csvColumn: 'sku', dbField: 'sku' },
        { csvColumn: 'quantita', dbField: 'quantity' }
      ];
      
      this.requiredFields = ['name', 'price', 'sku'];
    }
  }

  onImportTypeSelect(typeId: string): void {
    this.selectedImportType = typeId;
    this.uploadForm.get('importType')?.setValue(typeId);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.isFileTypeError = false;
    
    if (file) {
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        this.selectedFile = file;
        this.uploadForm.get('file')?.setValue(file);
    } else {
        this.selectedFile = null;
        this.uploadForm.get('file')?.setValue(null);
        this.isFileTypeError = true;
      }
    }
  }
  
  toggleAdvancedOption(option: string): void {
    if (option in this.advancedOptions) {
      this.advancedOptions[option] = !this.advancedOptions[option];
    }
  }
  
  isRequiredField(fieldId: string): boolean {
    return this.requiredFields.includes(fieldId);
  }

  nextStep(): void {
    if (this.currentStep < 5) {
      // Perform validations based on current step
      if (this.currentStep === 1) {
        if (!this.selectedFile) {
          alert('Seleziona un file CSV prima di procedere');
          return;
        }
        
        if (!this.selectedTable) {
          alert('Seleziona una tabella prima di procedere');
          return;
        }
        
        if (this.isFileTypeError) {
          alert('Il formato del file non è valido. Seleziona un file CSV.');
          return;
        }
        
        this.currentStep++;
        this.validateFile();
      }
      else if (this.currentStep === 2) {
        // Procedi solo se la validazione è passata
        if (this.validationResults && this.validationResults.isValid) {
          this.currentStep++;
        } else {
          alert('Risolvi gli errori di validazione prima di procedere');
        }
      } 
      else if (this.currentStep === 3) {
        // Verifica la mappatura delle colonne
        const unmappedRequired = this.checkRequiredMappings();
        if (unmappedRequired.length > 0) {
          alert(`Alcuni campi obbligatori non sono mappati: ${unmappedRequired.join(', ')}`);
          return;
        }
        this.currentStep++;
      } 
      else if (this.currentStep === 4) {
        this.importData();
      }
    }
  }
  
  checkRequiredMappings(): string[] {
    // Verifica che tutti i campi obbligatori siano mappati
    const mapped = this.columnMappings.map(m => m.dbField);
    return this.requiredFields.filter(field => !mapped.includes(field));
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateFile(): void {
    this.isLoading = true;
    this.validationResults = null;
    
    if (!this.selectedFile || !this.selectedTable) {
      alert('Seleziona una tabella e un file CSV');
      this.isLoading = false;
      return;
    }
    
    this.csvService.validateCsv(this.selectedFile, this.selectedTable).subscribe(
      (result) => {
        this.validationResults = result;
        this.isLoading = false;
        
        // Aggiorna automaticamente le mappature colonne in base alle intestazioni rilevate
        if (result.csvPreview && result.csvPreview.headers) {
          this.updateMappingsFromHeaders(result.csvPreview.headers);
        }
      },
      (error) => {
        console.error('Validation error:', error);
        this.isLoading = false;
        alert('Errore durante la validazione del file: ' + (error.message || 'Errore sconosciuto'));
      }
    );
  }
  
  updateMappingsFromHeaders(headers: string[]): void {
    // Aggiorna le mappature in base alle intestazioni rilevate nel CSV
    this.columnMappings = headers.map(header => {
      const normalizedHeader = header.toLowerCase().trim()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
          
      // Cerca una corrispondenza nei campi DB
      const matchingField = this.availableDbFields.find(field => 
          field.id.toLowerCase() === normalizedHeader ||
          field.name.toLowerCase() === header.toLowerCase());
          
      return {
        csvColumn: header,
        dbField: matchingField ? matchingField.id : ''
      };
    });
  }

  importData(): void {
    this.isLoading = true;
    this.importResults = null;
    
    // Prepara i dati aggiuntivi per l'importazione
    const importConfig = {
      mappings: this.columnMappings,
      options: this.advancedOptions
    };
    
    this.csvService.importCsv(
      this.selectedFile!, 
      this.selectedTable, 
      this.selectedImportType,
      importConfig
    ).subscribe(
      (result) => {
        this.importResults = result;
        this.isLoading = false;
        this.currentStep++;
      },
      (error) => {
        console.error('Import error:', error);
        this.isLoading = false;
        alert('Errore durante l\'importazione dei dati: ' + (error.message || 'Errore sconosciuto'));
      }
    );
  }

  resetForm(): void {
    this.currentStep = 1;
    this.selectedFile = null;
    this.selectedTable = '';
    this.selectedImportType = 'update';
    this.validationResults = null;
    this.importResults = null;
    this.isFileTypeError = false;
    this.showAdvancedOptions = false;
    this.advancedOptions = {
      skipHeader: true,
      strictValidation: false,
      sendNotification: false,
      delimiter: ',',
      encoding: 'UTF-8'
    };
    this.uploadForm.reset({
      table: '',
      importType: 'update',
      file: null
    });
  }
  
  downloadTemplate(tableId: string): void {
    // In a real application, this would call a service to download a template
    alert(`Download template per ${tableId} in progress...`);
  }
  
  downloadErrorsReport(): void {
    if (this.importResults && (this.importResults.errorDetails && this.importResults.errorDetails.length > 0)) {
      // In a real application, this would generate a CSV with error details
      alert('Download report errori in corso...');
    }
  }

  // Funzioni helper per il template
getTableName(tableId: string): string {
    const table = this.tables.find(t => t.id === tableId);
    return table ? table.name : '';
  }
  
  isUpdatedType(): boolean {
    return this.selectedImportType === 'update';
  }
  
  isReplaceType(): boolean {
    return this.selectedImportType === 'replace';
  }
  
  getImportStatus(): string {
    if (!this.importResults) return '';
    return this.importResults.status;
  }
  
  getCompletionPercentage(): string {
    if (!this.importResults || !this.importResults.imported || !this.importResults.totalRows) {
      return '0.0';
    }
    return (this.importResults.imported / this.importResults.totalRows * 100).toFixed(1);
  }
  
  isInterruptedStatus(): boolean {
    return this.importResults && this.importResults.status === 'interrupted';
  }
}