/**
 * Autocomplete Component
 * Provides location and command suggestions as the user types
 */

export interface AutocompleteOption {
  label: string;
  value: string;
  type: 'location' | 'command' | 'tool';
  description?: string;
}

export interface AutocompleteConfig {
  container: HTMLElement;
  inputElement: HTMLInputElement | HTMLTextAreaElement;
  onSelect: (option: AutocompleteOption) => void;
  maxResults?: number;
  minChars?: number;
}

// Location database for autocomplete
const LOCATIONS: AutocompleteOption[] = [
  // Major Cities
  { label: 'New York', value: 'New York', type: 'location', description: 'USA' },
  { label: 'London', value: 'London', type: 'location', description: 'UK' },
  { label: 'Paris', value: 'Paris', type: 'location', description: 'France' },
  { label: 'Tokyo', value: 'Tokyo', type: 'location', description: 'Japan' },
  { label: 'Sydney', value: 'Sydney', type: 'location', description: 'Australia' },
  { label: 'Los Angeles', value: 'Los Angeles', type: 'location', description: 'USA' },
  { label: 'San Francisco', value: 'San Francisco', type: 'location', description: 'USA' },
  { label: 'Chicago', value: 'Chicago', type: 'location', description: 'USA' },
  { label: 'Moscow', value: 'Moscow', type: 'location', description: 'Russia' },
  { label: 'Beijing', value: 'Beijing', type: 'location', description: 'China' },
  { label: 'Dubai', value: 'Dubai', type: 'location', description: 'UAE' },
  { label: 'Singapore', value: 'Singapore', type: 'location', description: 'Singapore' },
  { label: 'Hong Kong', value: 'Hong Kong', type: 'location', description: 'China' },
  { label: 'Shanghai', value: 'Shanghai', type: 'location', description: 'China' },
  { label: 'Mumbai', value: 'Mumbai', type: 'location', description: 'India' },
  { label: 'Delhi', value: 'Delhi', type: 'location', description: 'India' },
  { label: 'Cairo', value: 'Cairo', type: 'location', description: 'Egypt' },
  { label: 'Istanbul', value: 'Istanbul', type: 'location', description: 'Turkey' },
  { label: 'Rome', value: 'Rome', type: 'location', description: 'Italy' },
  { label: 'Berlin', value: 'Berlin', type: 'location', description: 'Germany' },
  { label: 'Madrid', value: 'Madrid', type: 'location', description: 'Spain' },
  { label: 'Barcelona', value: 'Barcelona', type: 'location', description: 'Spain' },
  { label: 'Amsterdam', value: 'Amsterdam', type: 'location', description: 'Netherlands' },
  { label: 'Vienna', value: 'Vienna', type: 'location', description: 'Austria' },
  { label: 'Prague', value: 'Prague', type: 'location', description: 'Czech Republic' },
  { label: 'Stockholm', value: 'Stockholm', type: 'location', description: 'Sweden' },
  { label: 'Copenhagen', value: 'Copenhagen', type: 'location', description: 'Denmark' },
  { label: 'Athens', value: 'Athens', type: 'location', description: 'Greece' },
  { label: 'Lisbon', value: 'Lisbon', type: 'location', description: 'Portugal' },
  { label: 'Dublin', value: 'Dublin', type: 'location', description: 'Ireland' },
  { label: 'Toronto', value: 'Toronto', type: 'location', description: 'Canada' },
  { label: 'Vancouver', value: 'Vancouver', type: 'location', description: 'Canada' },
  { label: 'Mexico City', value: 'Mexico City', type: 'location', description: 'Mexico' },
  { label: 'Sao Paulo', value: 'Sao Paulo', type: 'location', description: 'Brazil' },
  { label: 'Rio de Janeiro', value: 'Rio de Janeiro', type: 'location', description: 'Brazil' },
  { label: 'Buenos Aires', value: 'Buenos Aires', type: 'location', description: 'Argentina' },
  { label: 'Cape Town', value: 'Cape Town', type: 'location', description: 'South Africa' },
  { label: 'Seoul', value: 'Seoul', type: 'location', description: 'South Korea' },
  { label: 'Bangkok', value: 'Bangkok', type: 'location', description: 'Thailand' },
  { label: 'Jakarta', value: 'Jakarta', type: 'location', description: 'Indonesia' },
  { label: 'Kuala Lumpur', value: 'Kuala Lumpur', type: 'location', description: 'Malaysia' },
  { label: 'Manila', value: 'Manila', type: 'location', description: 'Philippines' },
  { label: 'Melbourne', value: 'Melbourne', type: 'location', description: 'Australia' },
  { label: 'Auckland', value: 'Auckland', type: 'location', description: 'New Zealand' },

  // Famous Landmarks
  { label: 'Eiffel Tower', value: 'Eiffel Tower', type: 'location', description: 'Paris, France' },
  { label: 'Statue of Liberty', value: 'Statue of Liberty', type: 'location', description: 'New York, USA' },
  { label: 'Big Ben', value: 'Big Ben', type: 'location', description: 'London, UK' },
  { label: 'Colosseum', value: 'Colosseum', type: 'location', description: 'Rome, Italy' },
  { label: 'Taj Mahal', value: 'Taj Mahal', type: 'location', description: 'Agra, India' },
  { label: 'Great Wall of China', value: 'Great Wall of China', type: 'location', description: 'China' },
  { label: 'Pyramids of Giza', value: 'Pyramids of Giza', type: 'location', description: 'Egypt' },
  { label: 'Machu Picchu', value: 'Machu Picchu', type: 'location', description: 'Peru' },
  { label: 'Christ the Redeemer', value: 'Christ the Redeemer', type: 'location', description: 'Rio, Brazil' },
  { label: 'Sydney Opera House', value: 'Sydney Opera House', type: 'location', description: 'Sydney, Australia' },
  { label: 'Burj Khalifa', value: 'Burj Khalifa', type: 'location', description: 'Dubai, UAE' },
  { label: 'Golden Gate Bridge', value: 'Golden Gate Bridge', type: 'location', description: 'San Francisco, USA' },
  { label: 'Empire State Building', value: 'Empire State Building', type: 'location', description: 'New York, USA' },
  { label: 'Tower of Pisa', value: 'Tower of Pisa', type: 'location', description: 'Italy' },
  { label: 'Stonehenge', value: 'Stonehenge', type: 'location', description: 'UK' },
  { label: 'Petra', value: 'Petra', type: 'location', description: 'Jordan' },
  { label: 'Angkor Wat', value: 'Angkor Wat', type: 'location', description: 'Cambodia' },

  // Natural Wonders
  { label: 'Grand Canyon', value: 'Grand Canyon', type: 'location', description: 'Arizona, USA' },
  { label: 'Mount Everest', value: 'Mount Everest', type: 'location', description: 'Nepal/Tibet' },
  { label: 'Niagara Falls', value: 'Niagara Falls', type: 'location', description: 'USA/Canada' },
  { label: 'Mount Fuji', value: 'Mount Fuji', type: 'location', description: 'Japan' },
  { label: 'Victoria Falls', value: 'Victoria Falls', type: 'location', description: 'Zambia/Zimbabwe' },
  { label: 'Great Barrier Reef', value: 'Great Barrier Reef', type: 'location', description: 'Australia' },
  { label: 'Amazon Rainforest', value: 'Amazon Rainforest', type: 'location', description: 'South America' },
  { label: 'Yellowstone', value: 'Yellowstone', type: 'location', description: 'Wyoming, USA' },
  { label: 'Yosemite', value: 'Yosemite', type: 'location', description: 'California, USA' },
];

// Command suggestions
const COMMANDS: AutocompleteOption[] = [
  { label: 'Show me...', value: 'Show me ', type: 'command', description: 'Navigate to a location' },
  { label: 'Fly to...', value: 'Fly to ', type: 'command', description: 'Fly the camera to a location' },
  { label: 'Add a marker at...', value: 'Add a marker at ', type: 'command', description: 'Place a point marker' },
  { label: 'Add a red marker at...', value: 'Add a red marker at ', type: 'command', description: 'Place a red point' },
  { label: 'Add a blue marker at...', value: 'Add a blue marker at ', type: 'command', description: 'Place a blue point' },
  { label: 'Draw a line from...', value: 'Draw a line from ', type: 'command', description: 'Draw a polyline' },
  { label: 'Draw a circle around...', value: 'Draw a circle around ', type: 'command', description: 'Create a circle' },
  { label: 'Add a label...', value: 'Add a label ', type: 'command', description: 'Add text label' },
  { label: 'Zoom in', value: 'Zoom in', type: 'command', description: 'Zoom closer' },
  { label: 'Zoom out', value: 'Zoom out', type: 'command', description: 'Zoom further' },
  { label: 'Switch to 2D mode', value: 'Switch to 2D mode', type: 'command', description: 'Flat map view' },
  { label: 'Switch to 3D mode', value: 'Switch to 3D mode', type: 'command', description: 'Globe view' },
  { label: 'Play animation', value: 'Play animation', type: 'command', description: 'Start time animation' },
  { label: 'Pause animation', value: 'Pause animation', type: 'command', description: 'Stop time animation' },
  { label: 'Clear all markers', value: 'Clear all markers', type: 'command', description: 'Remove all entities' },
];

export class Autocomplete {
  private container: HTMLElement;
  private inputElement: HTMLInputElement | HTMLTextAreaElement;
  private dropdown: HTMLDivElement | null = null;
  private options: AutocompleteOption[] = [];
  private filteredOptions: AutocompleteOption[] = [];
  private selectedIndex: number = -1;
  private maxResults: number;
  private minChars: number;
  private onSelect: (option: AutocompleteOption) => void;
  private isOpen: boolean = false;

  constructor(config: AutocompleteConfig) {
    this.container = config.container;
    this.inputElement = config.inputElement;
    this.onSelect = config.onSelect;
    this.maxResults = config.maxResults ?? 8;
    this.minChars = config.minChars ?? 1;

    // Combine locations and commands
    this.options = [...COMMANDS, ...LOCATIONS];

    this.init();
    this.injectStyles();
  }

  private init(): void {
    // Create dropdown container
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'autocomplete-dropdown';
    this.dropdown.style.display = 'none';
    this.container.appendChild(this.dropdown);

    // Set up event listeners
    this.inputElement.addEventListener('input', () => this.onInput());
    this.inputElement.addEventListener('keydown', (e) => this.onKeyDown(e as KeyboardEvent));
    this.inputElement.addEventListener('focus', () => this.onFocus());
    this.inputElement.addEventListener('blur', () => this.onBlur());

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target as Node)) {
        this.close();
      }
    });
  }

  private onInput(): void {
    const value = this.inputElement.value.trim();

    if (value.length < this.minChars) {
      this.close();
      return;
    }

    this.filter(value);
    this.render();
    this.open();
  }

  private onFocus(): void {
    const value = this.inputElement.value.trim();
    if (value.length >= this.minChars) {
      this.filter(value);
      this.render();
      this.open();
    } else if (value.length === 0) {
      // Show command suggestions on empty focus
      this.filteredOptions = COMMANDS.slice(0, this.maxResults);
      this.render();
      this.open();
    }
  }

  private onBlur(): void {
    // Delay close to allow click events on dropdown items
    setTimeout(() => this.close(), 150);
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (!this.isOpen) {
      if (e.key === 'ArrowDown' && this.inputElement.value.length === 0) {
        this.filteredOptions = COMMANDS.slice(0, this.maxResults);
        this.render();
        this.open();
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.moveSelection(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.moveSelection(-1);
        break;
      case 'Enter':
        if (this.selectedIndex >= 0) {
          const option = this.filteredOptions[this.selectedIndex];
          if (option) {
            e.preventDefault();
            this.selectOption(option);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'Tab':
        if (this.selectedIndex >= 0) {
          const option = this.filteredOptions[this.selectedIndex];
          if (option) {
            e.preventDefault();
            this.selectOption(option);
          }
        }
        break;
    }
  }

  private filter(query: string): void {
    const lowerQuery = query.toLowerCase();
    const words = lowerQuery.split(/\s+/);
    const lastWord = words[words.length - 1] || '';

    // Check if we're completing after a command prefix
    const commandPrefixes = ['show me', 'fly to', 'go to', 'marker at', 'add a', 'line from', 'circle around'];
    const isAfterPrefix = commandPrefixes.some(prefix => lowerQuery.includes(prefix));

    let searchOptions: AutocompleteOption[];
    let searchQuery: string;

    if (isAfterPrefix && lastWord.length > 0) {
      // After command prefix, search locations only
      searchOptions = LOCATIONS;
      searchQuery = lastWord;
    } else if (query.length <= 3) {
      // Short query, show commands first
      searchOptions = this.options;
      searchQuery = lowerQuery;
    } else {
      // Longer query, search all
      searchOptions = this.options;
      searchQuery = lowerQuery;
    }

    // Score and filter options
    const scored = searchOptions
      .map(option => {
        const labelLower = option.label.toLowerCase();
        const descLower = (option.description || '').toLowerCase();

        let score = 0;

        // Exact match
        if (labelLower === searchQuery) {
          score = 100;
        }
        // Starts with query
        else if (labelLower.startsWith(searchQuery)) {
          score = 80;
        }
        // Word starts with query
        else if (labelLower.split(/\s+/).some(word => word.startsWith(searchQuery))) {
          score = 60;
        }
        // Contains query
        else if (labelLower.includes(searchQuery)) {
          score = 40;
        }
        // Description contains query
        else if (descLower.includes(searchQuery)) {
          score = 20;
        }

        // Boost commands when query is short
        if (option.type === 'command' && searchQuery.length <= 3) {
          score += 10;
        }

        return { option, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.maxResults)
      .map(item => item.option);

    this.filteredOptions = scored;
    this.selectedIndex = scored.length > 0 ? 0 : -1;
  }

  private render(): void {
    if (!this.dropdown) return;

    if (this.filteredOptions.length === 0) {
      this.dropdown.innerHTML = '<div class="autocomplete-empty">No suggestions</div>';
      return;
    }

    this.dropdown.innerHTML = this.filteredOptions
      .map((option, index) => {
        const isSelected = index === this.selectedIndex;
        const typeClass = `autocomplete-type-${option.type}`;
        const selectedClass = isSelected ? 'autocomplete-item-selected' : '';

        return `
          <div class="autocomplete-item ${typeClass} ${selectedClass}" data-index="${index}">
            <span class="autocomplete-label">${this.highlight(option.label)}</span>
            ${option.description ? `<span class="autocomplete-description">${option.description}</span>` : ''}
            <span class="autocomplete-type">${option.type}</span>
          </div>
        `;
      })
      .join('');

    // Add click handlers
    this.dropdown.querySelectorAll('.autocomplete-item').forEach((item) => {
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        const index = parseInt((item as HTMLElement).dataset.index || '0', 10);
        if (this.filteredOptions[index]) {
          this.selectOption(this.filteredOptions[index]);
        }
      });

      item.addEventListener('mouseenter', () => {
        const index = parseInt((item as HTMLElement).dataset.index || '0', 10);
        this.selectedIndex = index;
        this.updateSelection();
      });
    });
  }

  private highlight(text: string): string {
    const query = this.inputElement.value.trim().toLowerCase();
    if (!query) return text;

    const words = query.split(/\s+/);
    let result = text;

    for (const word of words) {
      if (word.length > 0) {
        const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
        result = result.replace(regex, '<strong>$1</strong>');
      }
    }

    return result;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private moveSelection(delta: number): void {
    const newIndex = this.selectedIndex + delta;
    if (newIndex >= 0 && newIndex < this.filteredOptions.length) {
      this.selectedIndex = newIndex;
      this.updateSelection();
    }
  }

  private updateSelection(): void {
    if (!this.dropdown) return;

    this.dropdown.querySelectorAll('.autocomplete-item').forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('autocomplete-item-selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('autocomplete-item-selected');
      }
    });
  }

  private selectOption(option: AutocompleteOption): void {
    const currentValue = this.inputElement.value;

    // Determine how to insert the selection
    if (option.type === 'command') {
      // Replace entire input with command
      this.inputElement.value = option.value;
    } else {
      // Check if we're completing a command
      const commandPrefixes = [
        { pattern: /^(show me|fly to|go to|navigate to|take me to)\s*/i, append: true },
        { pattern: /^(add a \w+ marker at|marker at|add a marker at)\s*/i, append: true },
        { pattern: /^(draw a line from|line from)\s*/i, append: true },
        { pattern: /^(draw a circle around|circle around)\s*/i, append: true },
      ];

      let matched = false;
      for (const prefix of commandPrefixes) {
        const match = currentValue.match(prefix.pattern);
        if (match) {
          this.inputElement.value = match[0] + option.value;
          matched = true;
          break;
        }
      }

      if (!matched) {
        // Just insert the location value
        this.inputElement.value = option.value;
      }
    }

    // Move cursor to end
    this.inputElement.setSelectionRange(
      this.inputElement.value.length,
      this.inputElement.value.length
    );

    this.close();
    this.onSelect(option);

    // Focus back on input
    this.inputElement.focus();
  }

  private open(): void {
    if (!this.dropdown || this.filteredOptions.length === 0) return;
    this.dropdown.style.display = 'block';
    this.isOpen = true;
  }

  private close(): void {
    if (!this.dropdown) return;
    this.dropdown.style.display = 'none';
    this.isOpen = false;
    this.selectedIndex = -1;
  }

  addLocations(locations: AutocompleteOption[]): void {
    this.options = [...this.options, ...locations];
  }

  private injectStyles(): void {
    if (document.getElementById('autocomplete-styles')) return;

    const style = document.createElement('style');
    style.id = 'autocomplete-styles';
    style.textContent = `
      .autocomplete-dropdown {
        position: absolute;
        bottom: 100%;
        left: 0;
        right: 0;
        max-height: 300px;
        overflow-y: auto;
        background: #1a1a2e;
        border: 1px solid #3d3d5a;
        border-radius: 8px;
        margin-bottom: 8px;
        z-index: 1000;
        box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.3);
      }

      .autocomplete-item {
        display: flex;
        align-items: center;
        padding: 10px 14px;
        cursor: pointer;
        border-bottom: 1px solid #2d2d4a;
        transition: background 0.15s ease;
      }

      .autocomplete-item:last-child {
        border-bottom: none;
      }

      .autocomplete-item:hover,
      .autocomplete-item-selected {
        background: #2d2d4a;
      }

      .autocomplete-label {
        flex: 1;
        color: #e0e0e0;
        font-size: 14px;
      }

      .autocomplete-label strong {
        color: #818cf8;
        font-weight: 600;
      }

      .autocomplete-description {
        color: #9ca3af;
        font-size: 12px;
        margin-left: 12px;
      }

      .autocomplete-type {
        font-size: 10px;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 4px;
        margin-left: 8px;
        font-weight: 500;
      }

      .autocomplete-type-location .autocomplete-type {
        background: #1e3a5f;
        color: #60a5fa;
      }

      .autocomplete-type-command .autocomplete-type {
        background: #3f1f5c;
        color: #c084fc;
      }

      .autocomplete-type-tool .autocomplete-type {
        background: #1f5c3f;
        color: #4ade80;
      }

      .autocomplete-empty {
        padding: 12px;
        color: #6b7280;
        text-align: center;
        font-size: 13px;
      }

      /* Scrollbar styling */
      .autocomplete-dropdown::-webkit-scrollbar {
        width: 6px;
      }

      .autocomplete-dropdown::-webkit-scrollbar-track {
        background: #1a1a2e;
      }

      .autocomplete-dropdown::-webkit-scrollbar-thumb {
        background: #4d4d7a;
        border-radius: 3px;
      }

      .autocomplete-dropdown::-webkit-scrollbar-thumb:hover {
        background: #6a6aaa;
      }
    `;

    document.head.appendChild(style);
  }

  destroy(): void {
    if (this.dropdown) {
      this.dropdown.remove();
    }

    const styles = document.getElementById('autocomplete-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Export locations for external use
export { LOCATIONS, COMMANDS };
