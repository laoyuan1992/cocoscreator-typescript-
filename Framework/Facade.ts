import GameManager from "./GameManager";
import SoundManager from "../Sound/SoundManager";
import * as ManagerDefine from "./ManagerDefine"

//-------------------------------------------------------------------------------------------------
// 请参考unity版本中的逻辑
// WHJ
//-------------------------------------------------------------------------------------------------

export default class Facade
{
    // 管理器列表
    protected static m_Managers = new Array();
    // GameManagert节点
    protected static m_GameManager:cc.Node = null;

    public constructor() 
    {
    }

    // 获取GameManager节点
    public get AppGameManager() : cc.Node 
    {
        if (null == Facade.m_GameManager)
        {
            Facade.m_GameManager = cc.find("GameManager");
            // 设置为不可销毁
            if (null != Facade.m_GameManager)
            {
                cc.game.addPersistRootNode(Facade.m_GameManager);
            }
            else
            {
                console.error("GameManager == null");
            }
        }
        return Facade.m_GameManager;
    }

    // 添加一个管理器
    // typeName     名称（键值）
    // scriptName   脚本名称（cocos还有一个根据类型添加的，但是用模板方法并没有调用成功，编译错误）
    public AddManager(typeName : string, scriptName : string) : any
    {
        var GM = this.AppGameManager;
        if (null == GM) {
            return null;
        }
        var Mgr = Facade.m_Managers[typeName];
        if (null != Mgr) {
            return Mgr;
        }

        Mgr = GM.addComponent(scriptName);
        Facade.m_Managers[typeName] = Mgr;
        return Mgr;
    }

    // 获取一个管理器
    public GetManager(typeName : string ) : any
    {
        return Facade.m_Managers[typeName];
    }

    // 删除一个管理器
    public RemoveManager(typeName : string)
    {
        if (null == Facade.m_GameManager[typeName])
            return;
        delete Facade.m_GameManager[typeName];
    }

    public GetGameManager() : GameManager
    {
        return this.GetManager(ManagerDefine.ManagerName.Game);
    }

    public GetSoundManager() : SoundManager
    {
        return this.GetManager(ManagerDefine.ManagerName.Sound);
    }
}
