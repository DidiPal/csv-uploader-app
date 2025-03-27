import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CsvUploaderService {
  private apiUrl = 'api/csv'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  validateCsv(file: File, tableId: string): Observable<any> {
    // In a real application, you would upload the file to a backend API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tableId', tableId);
    
    // Per demo, simuliamo possibili scenari di errore
    // In un'implementazione reale, queste verifiche avverrebbero sul server
    
    // Controlli preliminari sul file
    if (file.size === 0) {
      return of({
        isValid: false,
        fileError: true,
        errorMessage: 'Il file è vuoto',
        columns: { valid: false, message: 'Impossibile leggere le colonne da un file vuoto' },
        requiredFields: { valid: false, message: 'Nessun dato presente' },
        categories: { valid: false, message: 'Nessun dato presente' }
      }).pipe(delay(500));
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return of({
        isValid: false,
        fileError: true,
        errorMessage: 'Il file supera la dimensione massima consentita (10MB)',
        columns: { valid: false, message: 'File troppo grande' },
        requiredFields: { valid: false, message: 'File troppo grande' },
        categories: { valid: false, message: 'File troppo grande' }
      }).pipe(delay(500));
    }
    
    // Per demo, generare risultati casuali ma coerenti per simulare vari scenari
    const columnsValid = Math.random() > 0.3;
    const requiredFieldsValid = Math.random() > 0.3;
    const categoriesValid = Math.random() > 0.3;
    const isValid = columnsValid && requiredFieldsValid && categoriesValid;
    
    // Messaggi di errore diversi in base alla tabella selezionata
    let columnsMessage, requiredFieldsMessage, categoriesMessage;
    
    if (tableId === 'products') {
      columnsMessage = columnsValid 
        ? 'Tutte le colonne sono state mappate correttamente' 
        : 'Colonne mancanti o non valide: Nome, Prezzo, SKU';
      
      requiredFieldsMessage = requiredFieldsValid 
        ? 'Tutti i campi obbligatori sono presenti' 
        : 'Campi obbligatori mancanti: Nome prodotto (riga 5), Prezzo (riga 12, 15), Categoria (riga 7)';
      
      categoriesMessage = categoriesValid 
        ? 'Tutte le categorie sono valide' 
        : 'Categorie non esistenti: "Elettronica Gaming" (riga 8), "Attrezzi Giardino" (riga 23)';
    } 
    else if (tableId === 'customers') {
      columnsMessage = columnsValid 
        ? 'Tutte le colonne sono state mappate correttamente' 
        : 'Colonne mancanti o non valide: Email, Nome, Cognome';
      
      requiredFieldsMessage = requiredFieldsValid 
        ? 'Tutti i campi obbligatori sono presenti' 
        : 'Campi obbligatori mancanti: Email (riga 3, 9), Codice Fiscale (riga 17)';
      
      categoriesMessage = categoriesValid 
        ? 'Tutti i gruppi cliente sono validi' 
        : 'Gruppi cliente non esistenti: "Premium Plus" (riga 5), "Enterprise Gold" (riga 12)';
    }
    else {
      columnsMessage = columnsValid 
        ? 'Tutte le colonne sono state mappate correttamente' 
        : 'Il file contiene colonne non riconosciute o mancano colonne essenziali';
      
      requiredFieldsMessage = requiredFieldsValid 
        ? 'Tutti i campi obbligatori sono presenti' 
        : 'Alcuni campi obbligatori sono mancanti o non validi in diverse righe';
      
      categoriesMessage = categoriesValid 
        ? 'Tutte le relazioni sono valide' 
        : 'Alcune relazioni fanno riferimento a entità che non esistono nel sistema';
    }
    
    // Aggiungere errori di formato e sintassi
    const formatErrors = !isValid ? [
      { row: 5, column: 'Data', value: '31/02/2023', message: 'Data non valida' },
      { row: 12, column: 'Email', value: 'user@domain', message: 'Formato email non valido' },
      { row: 18, column: 'Prezzo', value: '-50.00', message: 'Il prezzo non può essere negativo' },
      { row: 24, column: 'Codice Fiscale', value: 'ABCDEF12G34H567I', message: 'Codice fiscale non valido' }
    ] : [];
    
    // Aggiungere errori di encoding e caratteri speciali
    const encodingErrors = Math.random() > 0.7 ? [
      { type: 'encoding', message: 'Rilevati problemi di encoding nel file. Utilizzare UTF-8.' },
      { type: 'delimiter', message: 'Il delimitatore del CSV non è corretto. Utilizzare la virgola (,).' }
    ] : [];
    
    return of({
      isValid: isValid,
      columns: { valid: columnsValid, message: columnsMessage },
      requiredFields: { valid: requiredFieldsValid, message: requiredFieldsMessage },
      categories: { valid: categoriesValid, message: categoriesMessage },
      formatErrors: formatErrors,
      encodingErrors: encodingErrors,
      csvPreview: isValid ? {
        headers: ['ID', 'Nome', 'Categoria', 'Prezzo', 'Disponibilità'],
        sampleRows: [
          ['1001', 'Prodotto Test 1', 'Elettronica', '99.99', 'Si'],
          ['1002', 'Prodotto Test 2', 'Abbigliamento', '45.50', 'Si'],
          ['1003', 'Prodotto Test 3', 'Casa', '129.99', 'No']
        ]
      } : null
    }).pipe(delay(1500)); // Simulate network delay
    
    // In production use:
    // return this.http.post<any>(`${this.apiUrl}/validate`, formData);
  }
  
  importCsv(file: File, tableId: string, importType: string, config?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tableId', tableId);
    formData.append('importType', importType);
    
    // Aggiungi configurazioni avanzate se presenti
    if (config) {
      formData.append('config', JSON.stringify(config));
    }
    
    // Simulazione di diversi scenari durante l'importazione
    const scenarioType = Math.random();
    
    // Scenario 1: Importazione completata con successo (70% probabilità)
    if (scenarioType < 0.7) {
      const totalRows = Math.floor(Math.random() * 1000) + 100;
      const errors = Math.floor(Math.random() * 5); // Pochi errori
      
      return of({
        success: true,
        status: 'completed',
        totalRows: totalRows,
        imported: totalRows - errors,
        errors: errors,
        updated: importType === 'update' ? Math.floor((totalRows - errors) * 0.6) : 0,
        added: importType === 'update' 
          ? Math.floor((totalRows - errors) * 0.4) 
          : totalRows - errors,
        deleted: importType === 'replace' ? Math.floor(Math.random() * 500) : 0,
        softDeleted: importType === 'replace' ? Math.floor(Math.random() * 50) : 0,
        timestamp: new Date(),
        errorDetails: errors > 0 ? [
          { row: 3, column: 'Prezzo', value: 'abc', message: 'Valore non numerico per il campo prezzo' },
          { row: 17, column: 'Data', value: '31/02/2023', message: 'Data non valida' },
          { row: 42, column: 'Categoria', value: 'Luxury Premium', message: 'Riferimento a categoria inesistente' }
        ].slice(0, errors) : []
      }).pipe(delay(3000)); // Ritardo più lungo per simulare l'elaborazione
    }
    
    // Scenario 2: Errore durante l'elaborazione (20% probabilità)
    else if (scenarioType < 0.9) {
      const totalRows = Math.floor(Math.random() * 1000) + 100;
      const processedRows = Math.floor(totalRows * 0.3); // Elaborazione interrotta
      const errors = Math.floor(processedRows * 0.4); // Molti errori
      
      return of({
        success: false,
        status: 'interrupted',
        totalRows: totalRows,
        processedRows: processedRows,
        imported: processedRows - errors,
        errors: errors,
        errorMessage: 'L\'importazione è stata interrotta a causa di troppi errori',
        timestamp: new Date(),
        errorDetails: [
          { row: 3, column: 'Prezzo', value: '-100', message: 'Il prezzo non può essere negativo' },
          { row: 8, column: 'SKU', value: 'SKU123', message: 'SKU duplicato nel database' },
          { row: 12, column: 'Categoria', value: 'Sport Elite', message: 'Categoria non esistente' },
          { row: 17, column: 'Immagine', value: 'http://example.com/img.jpg', message: 'URL immagine non raggiungibile' },
          { row: 23, column: 'Quantità', value: '1000000', message: 'Valore al di fuori dell\'intervallo consentito (0-99999)' }
        ].slice(0, errors)
      }).pipe(delay(2000));
    }
    
    // Scenario 3: Errore critico del sistema (10% probabilità)
    else {
      return of({
        success: false,
        status: 'error',
        errorCode: 'SYSTEM_ERROR',
        errorMessage: 'Si è verificato un errore durante l\'elaborazione del file',
        systemMessage: 'Database connection timeout',
        timestamp: new Date(),
        suggestions: [
          'Verificare che il servizio di database sia attivo',
          'Riprovare l\'importazione in un secondo momento',
          'Se il problema persiste, contattare l\'amministratore di sistema'
        ]
      }).pipe(delay(1500));
    }
    
    // In production use:
    // const headers = new HttpHeaders().set('Content-Type', 'multipart/form-data');
    // return this.http.post<any>(`${this.apiUrl}/import`, formData);
  }
  
  // Metodo per scaricare il template CSV
  downloadTemplate(tableId: string): Observable<Blob> {
    // In produzione, questa chiamata restituirebbe un file blob dal server
    // return this.http.get(`${this.apiUrl}/template/${tableId}`, { responseType: 'blob' });
    
    // Per demo, simuliamo una risposta
    const csvContent = this.generateTemplateContent(tableId);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return of(blob).pipe(delay(500));
  }
  
  // Metodo ausiliario per generare template CSV
  private generateTemplateContent(tableId: string): string {
    let headers = [];
    let exampleRow = [];
    
    if (tableId === 'products') {
      headers = ['ID', 'Nome', 'Descrizione', 'Prezzo', 'Categoria', 'SKU', 'Quantità'];
      exampleRow = ['', 'Esempio Prodotto', 'Descrizione prodotto', '99.99', 'Elettronica', 'SKU12345', '10'];
    } else if (tableId === 'customers') {
      headers = ['ID', 'Nome', 'Cognome', 'Email', 'Telefono', 'Codice Fiscale', 'Indirizzo'];
      exampleRow = ['', 'Mario', 'Rossi', 'mario.rossi@example.com', '3331234567', 'RSSMRA80A01H501U', 'Via Roma 1, Roma'];
    } else {
      headers = ['ID', 'Nome', 'Descrizione'];
      exampleRow = ['', 'Esempio', 'Descrizione esempio'];
    }
    
    return headers.join(',') + '\n' + exampleRow.join(',');
  }
  
  // Metodo per generare un report degli errori
  generateErrorsReport(errorDetails: any[]): Observable<Blob> {
    // In produzione, questa potrebbe essere una chiamata API
    // return this.http.post(`${this.apiUrl}/errors-report`, errorDetails, { responseType: 'blob' });
    
    // Per demo, generiamo un CSV con gli errori
    const headers = ['Riga', 'Colonna', 'Valore', 'Errore'];
    const rows = errorDetails.map(error => 
      [error.row, error.column, error.value, error.message].join(',')
    );
    
    const csvContent = headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return of(blob).pipe(delay(500));
  }
}