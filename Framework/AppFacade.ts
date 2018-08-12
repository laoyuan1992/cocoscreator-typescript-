//-------------------------------------------------------------------------------------------------
// 请参考unity版本中的逻辑
// WHJ
//-------------------------------------------------------------------------------------------------
import Facade from "./Facade";
import LoginModule from "../Login/Model/LoginModule"
import URLConfig from "../Config/URLConfig"
import * as ManagerDefine from "./ManagerDefine"
import NetManager from "../Common/Net/NetManager";
import HallModule from "../Hall/Model/HallModule";
import PlayerDataModule from "../Player/Model/PlayerDataModule";
import SettingModule from "../Setting/Model/SettingModule";
import HeadPoolModule from "../HeadPool/Model/HeadPoolModule";
import PrivateRoomModule from "../PrivateRoom/Model/PrivateRoomModule";
import RecordModule from "../Record/Model/RecordModule";
import ServerError from "../ServerError/ServerError";
import ItemModule from "../Item/Model/ItemModule";
import MailModule from "../Mail/Model/MailModule";
import LSModule from "../LService/Model/LSModule";
import OtherPlayerModule from "../OtherPlayer/Model/OtherPlayerModule";
import ShopModule from "../Shop/Model/ShopModule";
import StatisticsModule from "../Statistics/Model/StatisticsModule";
import pbkiller = require( "../Lib/PbKiller/src/pbkiller" )
import EventName from "../Common/Event/EventName";
import ChrysanthemumModule from "../Chrysanthemum/Model/ChrysanthemumModule";

export default class AppFacade extends Facade 
{
    // 实例
    private static _Instance : AppFacade = null;

    public constructor() 
    {
        // 派生类的构造函数必须先显式调用父类的
        super();
    }

    // 获取实例
    public static get Instance() : AppFacade
    {
        if (AppFacade._Instance == null)
            AppFacade._Instance = new AppFacade();
        return AppFacade._Instance;
    }

    // 启动
    public StartUp() 
    {
        if ( cc.sys.isNative || window['wx'] == undefined )
        {
            this.InitCom();
        }
        else
        {
            pbkiller.preload(() => {
                this.InitCom();
            });
        }
        
    }

    // 初始化组件
    public InitCom()
    {
        this.InitModule();
        this.AddGameManager();
        this.InitMessageBox();
    }

    // 添加管理器
    public AddGameManager()
    {
        this.AddManager(ManagerDefine.ManagerName.Game, "GameManager");
        this.AddManager(ManagerDefine.ManagerName.Sound, "SoundManager"); 
    }

    // 初始化messagebox
    private InitMessageBox()
    {
        var gm = cc.find("GameManager");
        if (null == gm)
        {
            cc.error("InitMessageBox找不到GameManager");
            return;
        }
        var Path = "Hall/Prefabs/MessageBox";
        cc.loader.loadRes(Path, function(err, prefab) {
            if (err)
            {
                cc.error("加载界面MessageBox失败！");
                return;
            }
            var _UINode = cc.instantiate(prefab);
            if (null == _UINode)
            {
                cc.error("加载界面MessageBox成功，但实例化失败！");
                return;
            }
            gm.addChild(_UINode);
            _UINode.active = false;     // 默认隐藏
            cc.log("初始化MessageBox成功");
        });
    }

    // 初始化一些模块（这里是根据现有逻辑，以及参考了lua版本的才这么写的，但是并不知道ts是不是有更好的处理方案）
    private InitModule()
    {
        this.InitCommonModule();
        this.InitLoginModule();
        this.InitHallModule();
        this.InitOnShow();
    }

    // 登录
    private InitLoginModule()
    {
        NetManager.Init();
        LoginModule.Init();
        URLConfig.Init();
    }

    // 大厅
    private InitHallModule()
    {
        HallModule.Init();
        PlayerDataModule.Init();
        SettingModule.Init();
        HeadPoolModule.Init();
        PrivateRoomModule.Init();
        RecordModule.Init();
        ServerError.Init();
        ItemModule.Init();
        MailModule.Init();
        OtherPlayerModule.Init();
        ShopModule.Init();
        StatisticsModule.Init();
    }

    //通用模块
    private InitCommonModule()
    {
        LSModule.Init();
    }

    // 微信小游戏唤醒
    private InitOnShow()
    {
        if(window["wx"] == undefined) return;
        window["wx"].onShow( (res) => {
            console.log("OnShow");
            this.RecoverBackGroundMusic();
            cc.systemEvent.emit( EventName.EVENT_DO_LOGIN , {msg : "ConnectionService"} );
            ChrysanthemumModule.ShowChrysanthemum(100)
        });
    }

    //恢复背景音乐
    private RecoverBackGroundMusic()
    {
        if( cc.director.getScene().name == "Game" || cc.director.getScene().name == "Record" )
        {
            this.GetSoundManager().PlayGameBackGroundMusic( PrivateRoomModule.GetRoomType(), "game");
        }
    }
}
