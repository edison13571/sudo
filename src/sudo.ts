class Sudo {
    sudoSize: number;
    state:string;
    sudoSizeTotal:number;
    mapIdList: string[];
    mapAllUnits: Object;
    miniMap: string[];
    constructor(sudoSize:number) {
        this.sudoSize = sudoSize;
        this.state = 'pending';
        this.sudoSizeTotal = this.lineTotal(sudoSize);
        this.mapIdList = []
        this.mapAllUnits = {}
        this.init()
    }

    // 初始化数独
    init(){
        this.initMiniMap()
        this.initMap()
        this.initSub()
    }
    // 地图坐标字符
    initMiniMap() {
        let miniSize = Math.sqrt(this.sudoSize) + 1;
        let radar = []
        for (let i = 1; i < miniSize; i++) {
            for (let j = 1; j < miniSize; j++) {
                radar.push('' + i + j)
            }
        }
        this.miniMap = radar
    }
    // 生成地图单元格id，所有单元对象
    initMap() {
        let size = this.sudoSize + 1
        let areaLine = Math.sqrt(size)
        let line = 1,row = 1
        for (let i = 1; i < size; i++) {
            for (let j = 1; j < size; j++) {
                let xy = ''+Math.ceil(line/areaLine)+Math.ceil(row/areaLine)
                let locIndex =  this.miniMap.indexOf(xy) + 1
                if (++row===size) {line++;row=1;}
                let key = '' + locIndex + i + j
                this.mapIdList.push(key)
                this.mapAllUnits[key] = {number:'',state:'init'}
            }
        }
    }

    //初始化块，行，列
    initSub(){
        this.subUnitMap((item,index)=>{
            this[item] = {}
            this[item].members = this.filterLineArr(index)
            this[item].numbers = this[item].members.map(()=>0)
            this[item].total = this[item].members.map(()=>0)
        })

    }
    //输入判断及计算变化
    calChange(){
            let check = this.checkInput()
            if (!check) {
                this.state = 'error'
            } else {
               this.calNumbers()
               this.state = this.checkSuccess() ? 'success' : 'pending'
            }
    }

    //计算每个模块中的数字个数和所有值的和
    calNumbers(){
        let _self = this
        this.subUnitMap((item)=>{
            let arr = this[item].members
            arr.map((unit,index)=>{
                let obj = subMap(unit)
                this[item].numbers[index] = obj.numbers
                this[item].total[index] = obj.total
            })
        })
        function subMap(arr:string[]){
            let newArr = arr.map(item=> _self.unitValue(item))
            let total = newArr.reduce((a,b)=>a+b)
            let numbers = newArr.filter(item=>!!item).length
            return {total,numbers}
        }
    }

    //检查输入是否有重复数字
    checkInput():boolean{
        let res = true
        let _self = this
        this.subUnitMap((item)=>{
            if (res){
                let arr = this[item].members
                arr.map((unit)=>{
                    if (res) {
                        let newArr = unit.map(key=> _self.unitValue(key)).filter(value=>!!value)
                        let newSet = new Set(newArr)
                        let outInput = newArr.filter(key=>key < 0 || key > this.sudoSize)
                        res = outInput.length < 1 && newArr.length===newSet.size
                    }
                })
            }
        })
        return res
    }
    //检查是否成功
    checkSuccess():boolean{
        let arr = []
        this.subUnitMap((item)=>{
            arr=arr.concat(this[item].total)
        })
        for (let unit of arr){
            if (unit !== this.sudoSizeTotal){
                return false
            }
        }
        return true
    }
    //通过id返回值
    unitValue(key:string):number{
        return this.mapAllUnits[key].number - 0
    }

    //设置id的值
    setUnitValue(key:string,val:number,state:string='setting'){
        this.mapAllUnits[key].number = val
        this.mapAllUnits[key].state = state
    }

    //读取题目
    readQuestion(list){
        list.map(item=>{
            if (this.mapAllUnits.hasOwnProperty(item.key)) {
                this.setUnitValue(item.key, item.number,'setting')
            }
        })
    }

    findOnlyArr():string[]{
        let fin = []
        this.subUnitMap(item=>{
            if (fin.length===0) {
                let arr = this[item].numbers
                let findIndex = arr.indexOf(this.sudoSize - 1)
                if (findIndex >= 0) {
                    fin =  this[item]['members'][findIndex]
                }
            }

        })
        return fin
    }

    finishOne():boolean{
        let _self = this;
        let arr = this.findOnlyArr()
        if (arr.length > 0) {
            let numbers = arr.map(key=> _self.unitValue(key))
            let key = arr[numbers.indexOf(0)]
            for (let i=1;i<this.sudoSize+1;i++){
                if (numbers.indexOf(i) < 0) {
                    this.setUnitValue(key,i,'mac')
                    return true
                }
            }
        }
        return false
    }

    finishAllByOne(time:number=0){
        let res = this.finishOne()
        if (res) {
            this.calChange()
            setTimeout(()=>{
                this.finishAllByOne(time)
            },time)

        }
    }

    //行列快循环
    subUnitMap(fn){
        ['block','line','row'].map(fn)
    }
    //按照行列块的划分出相应的编号
    filterLineArr(index:number){
        let res = []
        let arr = JSON.parse(JSON.stringify(this.mapIdList))
        for (let i = 0; i < this.sudoSize; i++) {
            res.push(arr.filter(item=>item[index]===i+1+''))
        }
        return res
    }
    //计算单模块和目标
    lineTotal(size:number):number{
        return size === 1 ? 1 : size + this.lineTotal(--size)
    }
}

