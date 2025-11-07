import { useState, useRef } from 'react';
import { Download } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '../../common/Modal';
import { parseFlashcardsCSV, downloadFlashcardTemplate } from '../../../utils/csvParser';
import './BulkImportModal.css';

/**
 * Modal for bulk importing flashcards from CSV
 */
export function BulkImportModal({
  isOpen = false,
  onClose = null,
  onImport = null,
  loading = false
}) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [parseErrors, setParseErrors] = useState([]);
  const [importStep, setImportStep] = useState('upload'); // 'upload' | 'preview' | 'importing'
  const [importError, setImportError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setImportError('Please select a valid CSV file');
      return;
    }

    setFile(selectedFile);
    setImportError(null);

    try {
      const result = await parseFlashcardsCSV(selectedFile);

      if (result.errors.length > 0) {
        setParseErrors(result.errors);
      }

      setParsedData(result.data);
      setImportStep('preview');
    } catch (error) {
      setImportError(`Error parsing CSV: ${error.message}`);
      setParsedData(null);
      setParseErrors([]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files[0];
    handleFileSelect(droppedFile);
  };

  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files?.[0];
    handleFileSelect(selectedFile);
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) {
      setImportError('No valid flashcards to import');
      return;
    }

    setImportStep('importing');
    setImportError(null);

    try {
      await onImport(parsedData);
      // Reset state on success
      setTimeout(() => {
        setFile(null);
        setParsedData(null);
        setParseErrors([]);
        setImportStep('upload');
        if (onClose) {
          onClose();
        }
      }, 1000);
    } catch (error) {
      setImportError(error.message || 'Failed to import flashcards');
      setImportStep('preview');
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData(null);
    setParseErrors([]);
    setImportStep('upload');
    setImportError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    if (onClose) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Flashcards from CSV"
      size="lg"
    >
      <ModalBody>
        {importError && (
          <div className="error-alert" role="alert">
            {importError}
          </div>
        )}

        {importStep === 'upload' && (
          <>
            <div className="import-section">
              <h3>Upload CSV File</h3>

              <div
                className="drop-zone"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                role="region"
                aria-label="Drag and drop CSV file here"
              >
                <div className="drop-zone-content">
                  <div className="drop-icon">📁</div>
                  <p>Drag and drop CSV file here</p>
                  <p className="drop-hint">or click to browse</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="file-input"
                  aria-label="Select CSV file"
                />
              </div>
            </div>

            <div className="import-section">
              <h3>CSV Format</h3>
              <p>Your CSV file should have these columns:</p>
              <div className="csv-format">
                <code>
                  polish, english, level_id, category_slug, mode
                </code>
              </div>

              <p className="format-example">
                <strong>Example:</strong>
              </p>
              <div className="csv-format">
                <code>
                  słowo,word,A1,,vocabulary
                  <br />
                  dom,house,A1,family,vocabulary
                  <br />
                  Jak się masz?,How are you?,A1,,sentences
                </code>
              </div>

              <button
                className="download-template-button"
                onClick={downloadFlashcardTemplate}
                aria-label="Download CSV template"
              >
                <Download size={18} style={{ display: 'inline', marginRight: '6px' }} />
                Download Template
              </button>
            </div>

            <div className="format-notes">
              <h4>Important Notes:</h4>
              <ul>
                <li>
                  <strong>level_id</strong> is required (A1, A2, or B1)
                </li>
                <li>
                  <strong>category_slug</strong> is optional (only for A1)
                </li>
                <li>
                  <strong>mode</strong> defaults to "vocabulary" if not specified
                </li>
                <li>Maximum 500 flashcards per import</li>
              </ul>
            </div>
          </>
        )}

        {importStep === 'preview' && parsedData && (
          <>
            <div className="import-section">
              <h3>Import Preview</h3>

              {parseErrors.length > 0 && (
                <div className="validation-errors">
                  <h4>⚠️ Validation Errors ({parseErrors.length})</h4>
                  <div className="error-list">
                    {parseErrors.slice(0, 10).map((error, idx) => (
                      <div key={idx} className="error-item">
                        <span className="error-row">Row {error.row}:</span>
                        <span className="error-message">{error.message}</span>
                      </div>
                    ))}
                    {parseErrors.length > 10 && (
                      <div className="error-item">
                        <span className="error-note">
                          +{parseErrors.length - 10} more errors
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="import-stats">
                <div className="stat">
                  <span className="stat-label">Valid Flashcards:</span>
                  <span className="stat-value valid">{parsedData.length}</span>
                </div>
                {parseErrors.length > 0 && (
                  <div className="stat">
                    <span className="stat-label">Invalid Rows:</span>
                    <span className="stat-value error">{parseErrors.length}</span>
                  </div>
                )}
              </div>

              {parsedData.length > 0 && (
                <>
                  <h4>Preview (first 5 rows)</h4>
                  <div className="preview-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Polish</th>
                          <th>English</th>
                          <th>Level</th>
                          <th>Category</th>
                          <th>Mode</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 5).map((card, idx) => (
                          <tr key={idx}>
                            <td>{card.polish}</td>
                            <td>{card.english}</td>
                            <td>{card.level_id}</td>
                            <td>{card.category_slug || '—'}</td>
                            <td>{card.mode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 5 && (
                      <p className="more-rows">
                        ... and {parsedData.length - 5} more flashcard(s)
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {importStep === 'importing' && (
          <div className="importing-state">
            <div className="spinner"></div>
            <p>Importing {parsedData?.length || 0} flashcard(s)...</p>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        {importStep === 'upload' && (
          <>
            <button
              type="button"
              className="button-secondary"
              onClick={handleClose}
            >
              Cancel
            </button>
          </>
        )}

        {importStep === 'preview' && (
          <>
            <button
              type="button"
              className="button-secondary"
              onClick={handleReset}
            >
              Choose Different File
            </button>
            <button
              type="button"
              className="button-primary"
              onClick={handleImport}
              disabled={!parsedData || parsedData.length === 0 || loading}
              aria-busy={loading}
            >
              {loading ? 'Importing...' : `Import ${parsedData?.length || 0} Flashcard(s)`}
            </button>
          </>
        )}

        {importStep === 'importing' && (
          <button type="button" className="button-secondary" disabled>
            Please wait...
          </button>
        )}
      </ModalFooter>
    </Modal>
  );
}
