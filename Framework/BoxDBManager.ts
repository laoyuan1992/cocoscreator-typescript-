import Singleton from "../Common/Function/Singleton";
import Dictionary from "../Common/DataStruct/Dictionary";

// 本地数据库 
class BoxDBManager extends Singleton
{
    private BoxDBMap : Dictionary = new Dictionary();

    public Push( Key : string , Param : any )
    {   
        this.BoxDBMap.Add( Key, JSON.stringify(Param) );
        this.SaveBox( Key, JSON.stringify(Param) );
    }

    // 获得 也可以用来判断存不存在如果不存在 返回null
    public GetItem( Key : string ) : any
    {
        if( this.BoxDBMap.ContainsKey( Key ) )
        {
            return this.BoxDBMap.GetItem(Key);
        }
        let temp = this.GetBox(Key);
        if ( temp == null ) return null;
        return JSON.parse(temp);
    }

    public RemoveItem( Key : string )
    {
        this.BoxDBMap.Remove(Key);
        cc.sys.localStorage.removeItem( Key );
    }

    public ClearAllItem()
    {
        this.BoxDBMap.Clear();
        cc.sys.localStorage.clear();
    }

    private SaveBox( Key : string , Param : any )
    {
        if ( cc.sys.isNative || window['wx'] == undefined )
        {
            cc.sys.localStorage.setItem( Key, JSON.stringify(Param) )
        }else
        {
            window['wx'].setStorageSync(  Key , JSON.stringify(Param)  );
        }
    }

    private GetBox ( Key : string ) : any
    {
        if ( cc.sys.isNative || window['wx'] == undefined )
        {
            let temp = cc.sys.localStorage.getItem(Key);
        }else
        {
            window['wx'].getStorageSync( Key );
        }
    }

}
export default BoxDBManager.GetInstance();
//---------------------------------------------------使用例子--------------------------------
// 简单数据就直接获取插入
// 如果是复杂的数据
//例如1
// let UserData = 
// {
//     name : 'yuhuan',
//     age  : '26',
//     gold : 10000
// }
// BoxDBManager.Push('UserData', UserData);
//let Param = BoxDBManager.GetItem('UserData');
//cc.log(Param.name);

//例如2 ( 类中不能 写方法)
// class A
// {
//     public a = 3;
// }
 
// BoxDBManager.Push('UserData1', new A());
// let Param :A = BoxDBManager.GetItem('UserData1');
// cc.log(Param.a)
