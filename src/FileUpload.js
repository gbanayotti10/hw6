import React, { Component } from 'react';

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
      jsonData: null,  
    };
  }
  
  handleFileSubmit = (event) => {
    event.preventDefault();
    const { file } = this.state;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const json = this.csvToJson(text);
        this.setState({ jsonData: json });  
        this.props.set_data(json)
      };
      reader.readAsText(file);
    }
  };

csvToJson = (csv) => {
    const lines = csv.split("\n"); 
    const headers = lines[0].split(","); 
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(","); 
      const obj = {};

      headers.forEach((header, index) => {
        obj[header.trim()] = currentLine[index]?.trim(); 
      });

      if (Object.keys(obj).length && lines[i].trim()) {
        const parsedObj = {
          Date: new Date(obj.Date),  
          "LLaMA-3.1": parseInt(obj["LLaMA-3.1"]),
          "Claude": parseInt(obj["Claude"]),
          "PaLM-2": parseInt(obj["PaLM-2"]),
          "Gemini": parseInt(obj["Gemini"]),
          "GPT-4": parseInt(obj["GPT-4"]),
        };
        result.push(parsedObj);
      }
    }

    return result;
};


  render() {
    return (
      <div style={{ backgroundColor: "#f0f0f0", padding: 20 }}>
        <h2>Upload a CSV File</h2>
        <form onSubmit={this.handleFileSubmit}>
          <input type="file" accept=".csv" onChange={(event) => this.setState({ file: event.target.files[0] })} />
          <button type="submit">Upload</button>
        </form>
      </div>
    );
  }
}

export default FileUpload;