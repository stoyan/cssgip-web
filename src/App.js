import React, { Component } from 'react';
import './App.css';
import gip from 'cssgip-browser';

class App extends Component {
  
  constructor() {
    super();
    this.state = {
      files: [],
      data: [], // data about them files, after processing
    };
    document.documentElement.ondragenter = e => e.preventDefault();
    document.documentElement.ondragover = e => e.preventDefault();
    document.documentElement.ondrop = e => {
      e.preventDefault();
      this.update(e.dataTransfer.files);
    }
  }
  
  handleUploads(e) {
    this.update(e.target.files);
  }
  
  update(moreFiles) {
    const newFiles = Array.from(moreFiles);
    if (!newFiles) {
      return;
    }
    const files = this.state.files.concat(newFiles);
    this.setState({files});
    this.process(files);
  }
  
  process(files) {
    const data = this.state.data.slice();
    files.forEach((f, idx) => {
      if (!data[idx]) {
        const i = new Image();
        i.onload = () => {
          data[idx] = {
            image: i,
          };
          this.setState({data});
          setTimeout(() => {
            const res = doTheThing(i);
            data[idx] = {
              image: i,
              css: res.css,
              palettes: res.palettes,
              pretty: res.pretty,
            }
            this.setState({data});
          }, 100);
        };
        i.src = window.URL.createObjectURL(f);
      }
    });
  }
  
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Gradient Image Placeholder Generator</h1>
          <p>
            Upload or drop a photo or a few and get some background CSS to use as a placeholder
          </p>
        </div>
        <div className="Tool-in">
          <Uploads onChange={this.handleUploads.bind(this)} />
        </div>
        <div className="Tool-out">
          <Results files={this.state.files} data={this.state.data} />
        </div>
        <div className="App-footer">
          <p>
            Built by <a href="https://twitter.com/stoyanstefanov">Stoyan</a>. 
            The <a href="http://calendar.perfplanet.com/2018/gradient-image-placeholders/">how, why, etc.</a> blog post. 
            The <a href="https://github.com/stoyan/cssgip-web">code is here</a>.
          </p>
          <p>
            Hosting by <a href="https://www.dreamhost.com/r.cgi?447675">Dreamhost</a>,
            domain name by <a href="https://www.namecheap.com/?aff=107836">Namecheap</a>.
            Bye-bye now, take care then!
          </p>
        </div>
      </div>
    );
  }
}

const Uploads = ({onChange}) =>
  <div>
    <label htmlFor="files" className="Uploads-select" role="button">Select files...</label>
    <input 
      type="file" 
      id="files" 
      multiple 
      accept="image/*" 
      style={{display: 'none'}} 
      onChange={onChange}
    />
  </div>;


const Results = ({files, data}) => {
  if (files.length === 0) {return <span/>;}
  return (
    <table className="Results-table">
      <tbody>
      <tr><th width="30%">result</th><th width="20%">code</th><th width="50%">palette</th></tr>
      {files.map((f, idx) => {
        if (!f.type.startsWith('image/')) {
          return null;
        }
        return (
          <tr key={idx}>
            <td style={{verticalAlign: 'top'}}>
              {
                data[idx]
                  ? data[idx].css
                    ? <div style={{
                        background: data[idx].css[1],
                        display: 'inline-block',
                        }}>
                        <img 
                          src={data[idx].image.src} 
                          alt={idx} 
                          style={{
                            height: 'auto',
                            opacity: 0,
                            cursor: 'pointer',
                            float: 'left',
                          }}
                          width={data[idx].image.naturalWidth}
                          height={data[idx].image.naturalHeight}
                          onClick={ev => {
                            ev.target.style.opacity = ev.target.style.opacity === "0" ? 1 : 0
                          }}
                        />
                      </div>
                    : data[idx].image
                      ? <img alt={idx} src={data[idx].image.src} />
                      : 'munch, munch...'
                  : 'crunch, crunch...'
              }
            </td>
            <td style={{verticalAlign: 'top'}}>
              <pre style={{textAlign: 'left'}}>
               {(data[idx] && data[idx].css)
                  ? 'background: ' + data[idx].css[0] + ';\nbackground: ' + data[idx].pretty
                  : 'crunching...'
               }
              </pre>
            </td>
            <td style={{verticalAlign: 'top'}}>{
              (data[idx] && data[idx].palettes)
                ? Object.keys(data[idx].palettes).map((pal, ix) => (
                  <table style={{float: 'left'}} key={ix}>
                  <thead><tr><th>{pal}</th></tr></thead>
                  <tbody>{
                    data[idx].palettes[pal].map((p, idx) => 
                      (
                        <tr key={idx}>
                          <td style={{background: p, border: 0}}><code>{p}</code></td>
                        </tr>
                      )
                    )
                  }</tbody></table>
                ))
                : null}
            </td>
          </tr>
        );
      })}
      </tbody>
    </table>
  );
}


function doTheThing(img) {
  return gip(img, true);
}

export default App;
