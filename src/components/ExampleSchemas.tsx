import React from 'react';
import { Code2 } from 'lucide-react';

interface ExampleSchemasProps {
  onSelectSchema: (schema: string) => void;
  onSelectData: (data: string) => void;
}

const examples = [
  {
    name: 'Person Schema',
    schema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "age": {
      "type": "integer",
      "minimum": 0,
      "maximum": 150
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" },
        "zipCode": { "type": "string", "pattern": "^[0-9]{5}$" }
      },
      "required": ["street", "city"]
    }
  },
  "required": ["name", "age"]
}`,
    data: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zipCode": "10001"
  }
}`
  },
  {
    name: 'Array Schema',
    schema: `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "integer" },
          "name": { "type": "string" },
          "price": { "type": "number", "minimum": 0 }
        },
        "required": ["id", "name", "price"]
      },
      "minItems": 1
    }
  },
  "required": ["items"]
}`,
    data: `{
  "items": [
    { "id": 1, "name": "Apple", "price": 1.50 },
    { "id": 2, "name": "Banana", "price": 0.75 }
  ]
}`
  }
];

export default function ExampleSchemas({ onSelectSchema, onSelectData }: ExampleSchemasProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Code2 className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900">Example Schemas</h3>
      </div>
      
      <div className="space-y-2">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => {
              onSelectSchema(example.schema);
              onSelectData(example.data);
            }}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">{example.name}</div>
            <div className="text-xs text-gray-500 mt-1">
              Click to load this example
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}