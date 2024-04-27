(function() {
  'use strict';
  
  kintone.events.on('app.record.index.show', async function(event) {
    if (event.viewId != 6294444) {
      return event;
    } 
    
    const tblPrice = document.getElementById("tblPrice");
    const specifiedDate = new Date('2024-06-01');
    
    
        // 获取记录数据
    const respStoneList = await getRecords({app: 287, fields: [ "stoneName", "alias", "district", "handle", "sortId"], filterCond: 'handle in ("取扱中")'});
    const respPrice = await getRecords({fields: ["stoneId", "companyId", "districtId", "price", "startDate"]});
    const respProity = await getRecords({app: 199,fields: ["stoneId", "companyId", "startDate"]});
    
    const companyIds= ["0"       ,"910"      ,"920"    ,"930"  ,"940"  ,"950"  ,"970"  ,"995"    ,"990"  ,"980"    ,"960"];
    const companies = ["営業原価", "泉州鳴本", "金大通", "嵐磊", "伊聖", "松晟", "瑾盛", "三益友", "中揚", "大陸興", "欧凱"];
    const headers = ["#", "stoneId",  "地区","石種名"].concat(companies);
    
    // 创建表头
    const thead = document.createElement("thead");
    thead.className = "myTableHeader";
    const headerRow = document.createElement("tr");
    headers.forEach(headerText => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    tblPrice.appendChild(thead);
    

    
    
    // 对价格数据按照日期降序排列
    respPrice.records.sort((a, b) => new Date(b.startDate.value) - new Date(a.startDate.value));
    respProity.records.sort((a, b) => new Date(b.startDate.value) - new Date(a.startDate.value));
    
    // 构建价格数据的 Map
    const objStonePrices = {};
    respPrice.records.forEach(item => {
      if (!objStonePrices[item.stoneId.value]) {
        objStonePrices[item.stoneId.value] = {};
      }
      if (new Date(item.startDate.value) <= specifiedDate && !objStonePrices[item.stoneId.value][item.companyId.value]) {
        objStonePrices[item.stoneId.value][item.companyId.value] = item.price.value;
      }
    });
    
    
    const objStoneProity = {};
    respProity.records.forEach(item => {
      if (!objStoneProity[item.stoneId.value]) {
        objStoneProity[item.stoneId.value] = "";
      }

      if (new Date(item.startDate.value) <= specifiedDate && !objStoneProity[item.stoneId.value]) {
        objStoneProity[item.stoneId.value] = item.companyId.value;
        
      }
    });
    

    
    console.log(objStoneProity.records);
     let m=0;


    respStoneList.records.forEach(record => {
      if (record.handle.value.length && record.district.value.length > 0) {
        record.district.value.forEach(_val => {
          if (_val.value.used.value.length) {
            
            const newRow = tblPrice.insertRow();
            
            let classDistrict=""; //tr整行用类
            let classDistrictTd=""; //td单个用类
            switch(_val.value.area.value){
              case "祟武":
                classDistrict="soubu";
                classDistrictTd="soubuTd";
                break;
              case "南安":
                classDistrict="nanan";
                classDistrictTd="nananTd";
                break;
              case "外柵":
                classDistrict="gaisaku";
                classDistrictTd="gaisakuTd";
                break;
              default:
               classDistrict="default";
               classDistrictTd="defaultTd";
                
                
            }
            
            newRow.classList.add(classDistrict); //tr整行添加类
            
            newRow.insertCell(0).innerHTML = `<a href="${location.origin + "/k/287/show#record=" + record.$id.value}">${record.sortId.value}</a>`;
            newRow.insertCell(1).innerHTML = _val.value.stoneId.value;
            newRow.insertCell(2).innerHTML = _val.value.area.value;
            let cellStoneName = newRow.insertCell(3);
            cellStoneName.innerHTML = `<span style="display: block; text-align: left;margin:5px;"><span>${record.stoneName.value}</span>${record.alias.value ? `<br><span class='alias'>(${record.alias.value})</span>` : ""}</span>`;
            cellStoneName.classList.add(classDistrictTd);

            
           
            
            let stoneId = _val.value.stoneId.value;
            companyIds.forEach((companyId, j) => {
              
              const cell = newRow.insertCell(4 + j);
              const price = objStonePrices?.[stoneId]?.[companyId];
              
              if (price) {
                let price_formatted = Number(price).toLocaleString();
                cell.innerHTML = price_formatted;
                cell.classList.add('myalign');
                cell.dataset.realCost = companyId!="0"?Math.round((price * 153+500) * 1.1 / 0.75 + 700, 0).toLocaleString():price_formatted;
                
                
                
                // 添加鼠标悬停和离开事件
                cell.addEventListener('mouseenter', function() {
                  if (!cell.dataset.originalValue) {
                    cell.dataset.originalValue = cell.textContent;
                  }
                  const realCost = cell.dataset.realCost;
                  if (realCost) {
                    cell.textContent = realCost;
                    cell.classList.add('realcost'); 
                  }
                });
                cell.addEventListener('mouseleave', function() {
                  const originalValue = cell.dataset.originalValue;
                  if (originalValue) {
                    cell.textContent = originalValue;
                  }
                  cell.classList.remove('realcost'); 
                });
                
                
                
              }
            });//end companyIds foreach
            
            
            m++;
            let _proity = companyIds.indexOf(objStoneProity[stoneId]);
            if(_proity!=-1){
              tblPrice.rows[m].cells[_proity+4].classList.add('proity');
            }
            
          }//end if _val.value.used.value.length 判断子表中存在符合条件的单价表
          
        });//end record.district.value.forEach
      }//end if (record.handle.value.length && record.district.value.length > 0) 
    });//end resp.records.forEach
    
    
        // 设置特定列的宽度
    const colStart = 5; // 第3列
    const colEnd = 15;   // 第5列
    const colWidth = '80px';
    for (let i = colStart; i <= colEnd; i++) {
      tblPrice.querySelectorAll(`th:nth-child(${i}), td:nth-child(${i})`).forEach(col => {
        col.style.width = colWidth;
      });
    }
    
    
    
    
    
  });
  
  


})();
