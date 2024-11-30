import React, { useState } from "react";
import FileUpload from "./FileUpload";
import StreamGraph from "./Streamgraph";

function App() {
  const [data, setData] = useState(null); 

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      <FileUpload set_data={setData} />
      {data && <StreamGraph data={data} />} 
    </div>
  );
}

export default App;
