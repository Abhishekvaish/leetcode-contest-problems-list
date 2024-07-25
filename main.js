const ROWS_PER_PAGE = 100
const tableDiv = document.querySelector('#table')
const rowItemTemplate = document.querySelector('#row-item-template')
const rowHeaderTemplate = document.querySelector('#row-header-template')
const pageNoDiv = document.querySelector('#page-number')
const contestHeaderDiv = document.querySelector('.heading .name')
const pointsHeaderDiv = document.querySelector('.heading .points')
const state = {
    data : [],
    solved : [],
    searchedText : "",
    selected_point : "all",
    pageNo : 1,
    showContestName : true,
    sortBy: (a,b) => b['id']-a['id']
}

async function main(){
    state.data = await (await fetch('./data.json')).json()
    state.solved = new Set(JSON.parse(localStorage.getItem('solved')) ?? [])
    render(state)
}
main()


document.querySelector('#search-text').oninput = e => {
    state.searchedText = e.target.value.toLowerCase().trim()
    render(state)
    
}


document.querySelector("#show-contest-title").onchange = e => {
    state.showContestName = e.target.checked
    render(state)
}

document.querySelector('#points-select').onchange = e => {
    state.selected_point = e.target.value;
    render(state)
}

pageNoDiv.querySelector('.prev-page').onclick = _ => {
    state.pageNo -= 1
    render(state)
}
pageNoDiv.querySelector('.next-page').onclick = _ => {
    state.pageNo += 1
    render(state)

}


pointsHeaderDiv.querySelector('.sort').onclick = e => {
    if (e.currentTarget.dataset.asc === '0')    {
        e.currentTarget.dataset.asc = '1'
        state.sortBy = (a,b) => a['point'] - b['point']
    }
    else {
        e.currentTarget.dataset.asc = '0'
        state.sortBy = (a,b) => b['point'] - a['point']
    }
    render(state)
}


contestHeaderDiv.querySelector('.sort').onclick = e => {
    if (e.currentTarget.dataset.asc == '0'){
        state.sortBy = (a,b) => a['id'] - b['id']
        e.currentTarget.dataset.asc = '1'
    }
    else{
        state.sortBy = (a,b) => b['id'] - a['id']
        e.currentTarget.dataset.asc = '0'
    }
    render(state)
}


function check(problemId , checked){
    if (checked) state.solved.add(problemId)
    else state.solved.delete(problemId)
    localStorage.setItem('solved', JSON.stringify(Array.from(state.solved)))
    contestHeaderDiv.querySelector('.progress').innerText  = "(" + state.solved.size + "/" + state.data.length + ")"
    // render(state)

}



function render( {data , searchedText , pageNo, showContestName, sortBy, solved, selected_point}  ){
    // search logic 
    if (searchedText.length > 0)
        data  = data.filter(row => 
            row['name'].toLowerCase().includes(searchedText) || 
            row['contest'].toLowerCase().includes(searchedText)
        )
    

    if(selected_point != "all"){
        data = data.filter(row => row.point == selected_point)
    }

    // sort logic 
    data.sort(sortBy)

    // page number logic
    let offset = (pageNo-1) * ROWS_PER_PAGE
    if (offset > data.length){
        state.pageNo = 1
        offset = 0
    }
    pageNoDiv.querySelector('.curr-page').innerText  = pageNo + "/" + Math.ceil(data.length / ROWS_PER_PAGE)
    pageNoDiv.querySelector('.prev-page').disabled = pageNo === 1
    pageNoDiv.querySelector('.next-page').disabled = pageNo === Math.ceil(data.length / ROWS_PER_PAGE)

    data = data.slice(offset , offset+ROWS_PER_PAGE)    

    


    let rowHeading = ""    
    tableDiv.replaceChildren()
    data.forEach(row => {
        if (rowHeading != row["contest"] && showContestName){
            
            rowHeading = row["contest"]
            const rowHeader = rowHeaderTemplate.content.cloneNode(true)
            rowHeader.querySelector('div').innerText = rowHeading
            tableDiv.appendChild(rowHeader)
        }
        
        const rowItem = rowItemTemplate.content.cloneNode(true)
        
        rowItem.querySelector('input').setAttribute('id',row['id'])
        rowItem.querySelector('input').onchange = e => check(row['id'], e.target.checked)
        rowItem.querySelector('input').checked = solved.has(row['id'])
        rowItem.querySelector('label').setAttribute('for',row['id'])
        
        rowItem.querySelector('a').setAttribute("href",row["link"])
        rowItem.querySelector('a').innerText  = row["name"]
        
        rowItem.querySelector('.point').innerText = row['point']
        
        tableDiv.appendChild(rowItem)
    });


    // progress 
    contestHeaderDiv.querySelector('.progress').innerText  = "(" + state.solved.size + "/" + state.data.length + ")"
    

    window.state = state
}