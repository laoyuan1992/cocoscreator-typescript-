import Singleton from "../Common/Function/Singleton";
import EventName from "../Common/Event/EventName";
import SceneManager from "../Scene/SceneManager";
import UIManager from "../Common/UI/UIManager";
import { UIType } from "../Common/UI/UIDefine";
import Dictionary from "../Common/DataStruct/Dictionary";

class ResourcesManager extends Singleton
 {
    public AtlasMap : Dictionary = new Dictionary();

    //加载路径下全部资源
    public LoadAllResources( sceneName : string , callback ? : any )
    {
        cc.systemEvent.emit(EventName.EVENT_UI_STARTLOADRES);
        cc.loader.loadResDir(sceneName,
                            (completedCount,TotalCount,Item) => 
                            {
                                this.progressCallback(completedCount,TotalCount,Item);
                            },
                            (Err,Resource,urls) =>
                            {
                                this.completeCallback(Err,Resource,urls);
                                callback();
                            }
                            );
    }

    //加载完成一个Item回调
    private progressCallback( completedCount : number,TotalCount : number,Item : any )
    {
        let res : number = completedCount/TotalCount;
        cc.systemEvent.emit( EventName.EVENT_UI_REF_LOADPROGRESS,res );
    }

    //全部加载完成回调
    private completeCallback( Err : Error,Resource : any[],urls : string[])
    {
        cc.systemEvent.emit( EventName.EVENT_UI_LOADCOMPLETED);
        
    }

    //加载图片（res下的完整路径）
    public LoadSprite( AtlasPath : string , SpriteName : string ): cc.SpriteFrame
    {
        let Atlas : cc.SpriteAtlas  = null;
        if ( this.AtlasMap.ContainsKey( AtlasPath ) )
        {
            Atlas = this.AtlasMap.GetItem(AtlasPath);  
        }else
        {
            Atlas = cc.loader.getRes( AtlasPath, cc.SpriteAtlas );
            if(Atlas == null)
            {
                console.log("读取图集" + AtlasPath + "失败");
                return;
            }
            this.AtlasMap.Add( AtlasPath , Atlas );
        }
    
        if ( Atlas == null ) 
            return null;
        return Atlas.getSpriteFrame( SpriteName );
    }

    //加载动画（res下的完整路径）
    public LoadSpine( Path : string , ParentNode : cc.Node , Loop : boolean , AnimationName : string) : cc.Node
    {
        let Prefab : any = cc.loader.getRes( Path , cc.Prefab );
        if( null == Prefab ) return null;
        let Obj :cc.Node = cc.instantiate(Prefab);
        if( null == Obj ) return null;
        if(ParentNode != null)
        {
            Obj.parent = ParentNode;
        }
        Obj.setPosition( new cc.Vec2(0,0) );
        let Skeleton : sp.Skeleton = Obj.getComponent(sp.Skeleton);
        Skeleton.animation = AnimationName;
        if(Loop)
        {
            Skeleton.loop = Loop;
        }
        else
        {
            Skeleton.loop = ! Loop;
            Skeleton.setCompleteListener(() => {
                Obj.destroy();
            })
        }
        return Obj;
    }

    //加载预制体
    public LoadPrefab(Path : string , ParentNode : cc.Node) : cc.Node
    {
        let Prefab : any = cc.loader.getRes( Path , cc.Prefab );
        if( null == Prefab ) return null;
        let Obj :cc.Node = cc.instantiate(Prefab);
        if( null == Obj ) return null;
        if(ParentNode != null)
        {
            Obj.parent = ParentNode;
        }
        Obj.setPosition( new cc.Vec2(0,0) );
        return Obj;
    }
}

export default ResourcesManager.GetInstance();