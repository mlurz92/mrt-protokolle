const treeData = [
  {type:'folder',name:'Kopf',open:true,children:[
    {type:'folder',name:'Standard',open:true,children:[
      {type:'item',name:'Standard +/- KM',active:true},
      {type:'item',name:'Sequenzauswahl'},
      {type:'item',name:'SwiftMR_Standard +/- KM'}
    ]},
    {type:'folder',name:'Stroke',open:true,children:[
      {type:'item',name:'Auswahl'},{type:'item',name:'TGA'},{type:'item',name:'Standard #15'}
    ]},
    {type:'folder',name:'Dissektion',open:false,children:[{type:'item',name:'Standard'}]},
    {type:'folder',name:'Sinusthrombose',open:false,children:[{type:'item',name:'Standard'}]},
    {type:'folder',name:'AVM',open:false,children:[{type:'item',name:'Standard'}]},
    {type:'folder',name:'Aneurysma',open:false,children:[{type:'item',name:'Z.n. Coiling/Clipping'}]},
    {type:'folder',name:'Entzündung',open:false,children:[{type:'item',name:'Standard'}]},
    {type:'folder',name:'MS',open:false,children:[{type:'item',name:'Verlauf nativ / KM'},{type:'item',name:'Schädel + Wirbelsäule'},{type:'item',name:'Erstdiagnostik'}]},
    {type:'folder',name:'Epilepsie',open:false,children:[{type:'item',name:'Standard'}]},
    {type:'folder',name:'Neurodegeneration',open:false,children:[{type:'item',name:'Standard'}]},
    {type:'folder',name:'Kopfschmerz Migräne',open:false,children:[{type:'item',name:'Standard'}]}
  ]}
];

function drawTree(node, level=0){
  let html='';
  for(const n of node){
    if(n.type==='folder'){
      html += `<div class="node folder ${n.open?'open':''}" style="--level:${level}"><span class="twisty">${n.open?'▾':'▸'}</span><span class="foldericon">▭</span>${n.name}</div>`;
      if(n.open && n.children) html += drawTree(n.children, level+1);
      if(!n.open && n.children?.length) html += `<div class="node item ghost" style="--level:${level+1}"><span class="doc">▤</span>${n.children[0].name}</div>`;
    } else {
      html += `<div class="node item ${n.active?'selected':''}" style="--level:${level}"><span class="doc">▤</span>${n.name}</div>`;
    }
  }
  return html;
}

document.getElementById('tree').innerHTML = drawTree(treeData);
