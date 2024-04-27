(function() {
  'use strict';
  
  kintone.events.on('app.record.index.show', async function(event) {
    if (event.viewId != 6294475) {
      return event;
    } 
    console.log(333333333333333333333333)
    const tblPrice = document.getElementById("tblPrice");
    const specifiedDate = new Date('2024-06-01');
    
    
        // 获取记录数据
    const respStoneList = await getRecords({app: 287, fields: [ "stoneName", "alias", "district", "handle", "sortId"], filterCond: 'handle in ("取扱中")'});
    const respPrice = await getRecords({fields: ["stoneId", "companyId", "districtId", "price", "startDate"],filterCond: 'companyId="930"'});

    
    // const companyIds= ["0"       ,"910"      ,"920"    ,"930"  ,"940"  ,"950"  ,"970"  ,"995"    ,"990"  ,"980"    ,"960"];
    // const companies = ["営業原価", "泉州鳴本", "金大通", "嵐磊", "伊聖", "松晟", "瑾盛", "三益友", "中楊", "大陸興", "欧凱"];
    // const headers = ["#", "stoneId",  "地区","石種名"].concat(companies);
    const headers = ["#", "stoneId",  "地区","石種名","現単価","新単価","調整幅","旧実行開始日","新実行開始日"]
    
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

    
    // 构建价格数据的 Map
    const objStonePrices = {};
    respPrice.records.forEach(item => {
      if (!objStonePrices[item.stoneId.value]) {
        objStonePrices[item.stoneId.value] = {};
      }
      // if (new Date(item.startDate.value) <= specifiedDate && Object.entries(objStonePrices[item.stoneId.value])) {
      if (new Date(item.startDate.value) <= specifiedDate) {
        objStonePrices[item.stoneId.value]["startDate"]=item.startDate.value;
        objStonePrices[item.stoneId.value]["price"]=item.price.value;
      }
    });
    
    console.log(objStonePrices)


    




    respStoneList.records.forEach(record => {
      if (record.handle.value.length && record.district.value.length > 0) {
        record.district.value.forEach(_val => {
          if (_val.value.used.value.length) {
            
            const newRow = tblPrice.insertRow();
            
            let classDistrict="";
            switch(_val.value.area.value){
              case "祟武":
                classDistrict="soubu";
                break;
              case "南安":
                classDistrict="nanan";
                break;
              case "外柵":
                classDistrict="gaisaku";
                break;
              default:
               classDistrict="default";
                
                
            }
            
            newRow.classList.add(classDistrict);
            
            newRow.insertCell(0).innerHTML = `<a href="${location.origin + "/k/287/show#record=" + record.$id.value}">${record.sortId.value}</a>`;
            newRow.insertCell(1).innerHTML = _val.value.stoneId.value;
            newRow.insertCell(2).innerHTML = _val.value.area.value;
            newRow.insertCell(3).innerHTML = `<span style="display: block; text-align: left;"><span>${record.stoneName.value}</span>${record.alias.value ? `<br><span class='alias'>(${record.alias.value})</span>` : ""}</span>`;
            

            
           
          
     
              
              const cell = newRow.insertCell(4);
              const price = objStonePrices?.[ _val.value.stoneId.value]?.["price"];
              
              if (price) {
                let price_formatted = Number(price).toLocaleString();
                cell.innerHTML = price_formatted;
                cell.classList.add('myalign');
              }
              
              let _startDate = objStonePrices?.[ _val.value.stoneId.value]?.["startDate"];
              _startDate=_startDate?`<input type="date" value="${_startDate}" disabled>`:"";
              newRow.insertCell(5).innerHTML = "<input>"
              newRow.insertCell(6).innerHTML = "調整幅　自動計算"
              newRow.insertCell(7).innerHTML =_startDate;
              newRow.insertCell(8).innerHTML = '<input type="date">';
     
            
            


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
