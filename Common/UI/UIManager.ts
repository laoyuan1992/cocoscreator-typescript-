//-------------------------------------------------------------------------------------------------
// UI管理器
// 负责游戏中界面的创建销毁等逻辑
// WHJ
//-------------------------------------------------------------------------------------------------
import * as UIDefine from "./UIDefine"
import EventName from "../Event/EventName"
import Singleton from "../../Common/Function/Singleton"

class UIManager extends Singleton 
{
    // UI父节点
    private _Parent : cc.Node = null;
    // UI实例列表
    // 名字 + 实例
    private _UIList = new Array();

    private _UIRes = new UIDefine.UIPanelResDefine();
    // 获取实例

    public constructor()
    {
        super();
    }

    // 获取ui的父节点
    public get Parent() : cc.Node
    {
        if ( this._Parent == null )
        {
            // cocos creator的场景中似乎没有象unity中的guicamera
            // 都是往Canvas上挂载节点的
            this._Parent = cc.find( UIDefine.UIMisc.UIParentName );
        }
        return this._Parent;
    }

    // 清空所有，一般在加载完场景后要调用下
    private ClearAll()
    {
        this._UIList.length = 0;
        this._Parent = null;
    }

    // 创建UI
    // ResName          预制体名称，暂时只提供了资源名称一个关键字，所以需要保证prefab名称不能重要，如果需求确有冲突再作调整
    public ShowUI( ut : UIDefine.UIType ) : any
    {
        var ResName = this._UIRes.GetUIRes(ut);
        if ( ResName.length == 0 )
            return;
      
        var path = "Hall/Prefabs/" + ResName;
        return this.CreateUI(ut , path);
    }

    //创建UIByPath
    public ShowGameUI( param : any ) : any
    {
        this.CreateUI( param.type, param.path );
    }

    // 创建UI (这个路径以后可能需要整理)
    private CreateUI( ut : number , path : string ) : any
    {
        cc.log("CreateUI:" + path);
        if ( this.GetUI(ut) != null )
        {
            cc.warn("加载界面：" + path + "重名，请检查资源！");
            return null;
        }
        var UIParent = this.Parent;
        if ( null == UIParent )
        {
            cc.error("加载界面:" + path + "找不到UI父节点！");
            return null;
        }

        let prefab : cc.Prefab = cc.loader.getRes( path ,cc.Prefab );
        if ( prefab == null )
        {
            cc.error( "加载界面:" + path + "失败！" );
            return null;
        }
        let _UINode : cc.Node = cc.instantiate(prefab);
        if ( null == _UINode )
        {
            cc.error( "加载界面:" + path + "成功，但实例化失败！" );
            return null;
        }
        UIParent.addChild( _UINode );
        this.AddUINode( ut, _UINode );
        return _UINode;
    }

    // 添加一个UI节点
    private AddUINode( ut : UIDefine.UIType, UINode : cc.Node )
    {
        cc.log( "AddUINode:" + ut.toString() );
        this._UIList[ut] = UINode;
    }

    // 销毁UI
    public DestroyUI( ut : UIDefine.UIType )
    {
        var UINode = this.GetUI(ut);
        if (null == UINode)
        {
            cc.log("DestroyUI找不到节点！");
            return;
        }
        // 从场景中释放
        cc.log( "DestroyUI:" + ut.toString() );
        UINode.destroy();
        this._UIList[ut] = null;
    }

    // 获取UI
    public GetUI( ut : UIDefine.UIType )
    {
        return this._UIList[ut];
    }
}
export default UIManager.GetInstance();