# My screeps AI
![](https://screeps.com/images/logotype-animated.svg)

## TODO
### Working on
```
```
### Short term
```
Power Spawn rut
    Only allow stocking the power spawn if the creep has > 50 TTL
    Because if it dies... it breaks the "go in evenly" logic
    This probably affects lab logic too :/

Add all the reactions I want to

Remove the replacement/waves logic from power banks
    Replace it with "finishing it off" logic on a failure

Reduce lab logging amount if it's all 0's

Remove Queued Creep logs

Power
    Power creeps control

Cache containers shouldn't be built until towers
    Will require moving a stage
```
### Mid term:
```
Transfer rut
    Rooms should have a transfer ID, of which one they're working on
    Each tick it tries to get that transfer
    If that transfer is gone, the function returns the rooms next one
    The room then updates its ID

Energy donor room order should shuffled
    Rooms early in the list are being used up
    This means they're not loading their nuker with energy

Lab rut
    Not sure what to do about it... but this is the rut:
    amountLeftToLoad went to -700
    Combining U + L
    450 L left in reagent lab
    250 UL left in compound lab
    Stocker trying to withdraw more constantly

MyMemory.Settings
    Settings I can change via flags (that directly match the settings key)
    Constants are all numbers
    eg:
        set-CONSCRIPTION_RANGE-5
        set-OBSERVER_WIDTH-5

Towers sitting on 50% letting containers die

Attack creeps to kill construction sites

Need to neaten up the spawn constants

Attack creeps need to not update target every 5 ticks
    Because when I indicate what to target, it just gets removed in 5 :(
    Possibly leave a flag to set that
    Maybe use the setting memory logic

Signing controller with flag string
    Flag limit is 60 characters
    Sign limit is 100 characters

Gaps between donate and spawn laborer/upgrader amounts
```
### Long term:
```
Auto safe mode when < stage 2.6, and hostile creep enters 

Monitor force laborer spawns in linked rooms
    They should only be used to get the room out of ruts
    I'm thinking that the ruts can be observed and fixed through this monitoring

Buffing

Remote spawning for low stage rooms
    If a room under stage 6 (no terminal)
    Maybe a stage 8 room provides them creeps
    Only if the stage 8 room is within ~2-3 rooms
    Otherwise the TTL will make it pretty pointless

Make a ranged creep for dealing with other attack creeps
    Call it legolas lol

Attack logic should be combined
    Attacking is very similar logic, and the system I have complicates it
    They should be combined and using the memory flag constants for settings
    Example:
        When sending the charge, it should check the memory to see if its going to repeat (attack-pressure)
        
Attack Hold
    Maintain 1 creep in the room
    Spawn when they're about to die
    Only use 1 room provider, and spawn it when the TTL < 150 + (travelDistance * 50) 

Attack Large
    Very similar to AttackQuick
    Only attack when 1 of the attack creeps has < 300ish ticks to live
    Once the creep spawns, provide a time estimate of when it will begin (using tick time)
    Rooms should not make any other creeps until the attack is done (like AttackQuick)

Attack Healer Drain
    healer-drain
    Sends a bunch of healers (just HEAL + MOVE)
    They move in a tight ball
    They just get off the edge of the map and heal each other
    Will be used to empty their towers before the attack

Put in an optional attack-renew flag
    For all attacks, it'd be another state before rally
    Like another rally flag, but they wait until they're all there
    Once they're all there, they all renew and head to rally flag
    They wait again at the rally flag

Repeat attack target reticle

Watch-start/stop flag
    A 2nd observer to continuously watch a room

Offload
    offload-start & offload-end
    Used when abandoning a room or being nuked
    Just pushes everything out via the terminal

Scavenger shouldn't check state every tick
    Only when they get to their target 

Downgrade controller creep
    Flag name "downgrade-{X}"
    Where X is how many CLAIM parts (matched by MOVE parts)
    It varies in claim parts because 1 would block it, but 25 would be reducing it a lot
    Maybe a repeat option, for when it dies

Bank object shouldn't be nullable
    It should be stored as a different type
    But pulled out as type MyRoom

Scrubs to wreck message
    If it's a respawn or novice area, include the time it wears off
    Give the message a cooldown of the ending time - 5 minutes so if they're low level still it'll re-email
    Api is Game.map.getRoomStatus(roomName)
        https://docs.screeps.com/api/#Game.map.getRoomStatus

Link pos and storage pos might not need to be stored

Stocker states could be optimised
    By not just blindly going back to DespositResources

Need to remove the cleaning logic
    Only after its been a few months at full running, with no errors
    Need to wait until buffing is working for the stockers cleaning labs
    Need to wait until the transfers work by Id, for the banklinkers cleaning terminal

Need a way to determine what minerals are bottlenecked
    Every 100 loops, check which rooms having mining active and the resource is empty
    Need a way to clear it too, for when I get a new room to mining level
    Not sure how to store that information
    Not sure if it should be historic to last clear, or only have a timeframe of a few weeks
    Make sure this logic is done after the mineral controller has set active to true/false

New map visuals for avoiding/power banks
```

## Flag Names
```
ex-1 to 60
cont
tower-1 to 6
storage
link-source
link-bank
link-controller
spawn
power-spawn
observer-set-{WIDTH}
bank-linker-pos
digger-cont
lab-buffer
lab-reagent-1
lab-reagent-2

sign
sign-all
claim
scavenge-{RESOURCE_AMOUNT}
life-support
tower-aggressive

multishard-claim-portal
multishard-claim-target
multishard-claim-laborer


//Holds the launching of nukes until the flag is removed
//Use this to queue launches on the same tick
nuke-hold 
nuke-launch

attack-quick-rally
attack-quick-room-target
attack-pressure-rally
attack-pressure-room-target
attack-prio

profile
profile-function
```
## Creep Says
```
⚡ Energy
🏦 Bank/Storage
💎 Resource
🧪 Reagent
🔬 Lab
⚗️ Compound
☢ Nuker
💪 Power
```

### Room controller levels in a nice format:

| Lvl  | Req        | Other                 | Towers | Links | Spawns | Extensions | Ramparts | Labs |
|------|------------|-----------------------|--------|-------|--------|------------|----------|------|
| 1    | 200        | Roads, 5 Containers   |        |       | 1      |            |          |      |
| 2    | 45,000     | Walls                 |        |       |        | 5 50 cap   | 300K     |      |
| 3    | 135,000    |                       | 1      |       |        | 10 50 cap  | 1M       |      |
| 4    | 405,000    | Storage               |        |       |        | 20 50 cap  | 3M       |      |
| 5    | 1,215,000  |                       | 2      | 2     |        | 30 50 cap  | 10M      |      |
| 6    | 3,645,000  | Extractor, Terminal   |        | 3     |        | 40 50 cap  | 30M      | 3    |
| 7    | 10,935,000 |                       | 3      | 4     | 2      | 50 100 cap | 100M     | 6    |
| 8    | -          | Observer, Power Spawn | 6      | 6     | 3      | 60 200 cap | 300M     | 10   |

### Compounds in a nice format
| Compound          | Reagents              | Cooldown  | Part          | Effect
|-------------------|-----------------------|-----------|---------------|--------
| Base: Prio 0          
| OH                | H + O                 | 20        | -             | -
| ZK                | Z + K                 | 5         | -             | -
| UL                | U + L                 | 5         | -             | -
| Base: Prio 0.5            
| G                 | ZK + UL               | 5         | -             | -
| Tier 1: Prio 1            
| UH                | U + H                 | 10        | ATTACK        | +100% attack effectiveness
| UO                | U + O                 | 10        | WORK          | +200% harvest effectiveness
| KH                | K + H                 | 10        | CARRY         | +50 capacity
| KO                | K + O                 | 10        | RANGED_ATTACK | +100% rangedAttack and rangedMassAttack effectiveness
| LH                | L + H                 | 15 	    | WORK          | +50% repair and build effectiveness without increasing the energy cost
| LO                | L + O                 | 10 	    | HEAL          | +100% heal and rangedHeal effectiveness
| ZH                | Z + H                 | 20 	    | WORK          | +100% dismantle effectiveness
| ZO                | Z + O                 | 10 	    | MOVE          | +100% fatigue decrease speed
| GH                | G + H                 | 10 	    | WORK          | +50% upgradeController effectiveness without increasing the energy cost
| GO                | G + O                 | 10 	    | TOUGH         | -30% damage taken
| Tier 2: Prio 2            
| UH<sub>2</sub>O   | UH + OH               | 5 	    | ATTACK        | +200% attack effectiveness
| UHO<sub>2</sub>   | UO + OH               | 5         | WORK          | +400% harvest effectiveness
| KH<sub>2</sub>O   | KH + OH               | 5 	    | CARRY 	    | +100 capacity
| KHO<sub>2</sub>   | KO + OH               | 5         | RANGED_ATTACK | +200% rangedAttack and rangedMassAttack effectiveness
| LH<sub>2</sub>O   | LH + OH               | 10        | WORK          | +80% repair and build effectiveness without increasing the energy cost
| LHO<sub>2</sub>   | LO + OH               | 5         | HEAL          | +200% heal and rangedHeal effectiveness
| ZH<sub>2</sub>O   | ZH + OH               | 40        | WORK          | +200% dismantle effectiveness
| ZHO<sub>2</sub>   | ZO + OH               | 5         | MOVE          | +200% fatigue decrease speed
| GH<sub>2</sub>O   | GH + OH               | 15        | WORK          | +80% upgradeController effectiveness without increasing the energy cost
| GHO<sub>2</sub>   | GO + OH               | 30        | TOUGH         | -50% damage taken
| Tier 3: Prio 3
| XUH<sub>2</sub>O  | UH<sub>2</sub>O + X   | 60        | ATTACK        | +300% attack effectiveness 
| XUHO<sub>2</sub>  | UHO<sub>2</sub> + X   | 60        | WORK          | +600% harvest effectiveness
| XKH<sub>2</sub>O  | KH<sub>2</sub>O + X   | 60        | CARRY         | +150 capacity
| XKHO<sub>2</sub>  | KHO<sub>2</sub> + X   | 60        | RANGED_ATTACK | +300% rangedAttack and rangedMassAttack effectiveness
| XLH<sub>2</sub>O  | LH<sub>2</sub>O + X   | 65        | WORK          | +100% repair and build effectiveness without increasing the energy cost
| XLHO<sub>2</sub>  | LHO<sub>2</sub> + X   | 60        | HEAL          | +300% heal and rangedHeal effectiveness
| XZH<sub>2</sub>O  | ZH<sub>2</sub>O + X   | 160       | WORK          | +300% dismantle effectiveness
| XZHO<sub>2</sub>  | ZHO<sub>2</sub> + X   | 60        | MOVE          | +300% fatigue decrease speed
| XGH<sub>2</sub>O  | GH<sub>2</sub>O + X   | 80        | WORK          | +100% upgradeController effectiveness without increasing the energy cost
| XGHO<sub>2</sub>  | GHO<sub>2</sub> + X   | 150 	    | TOUGH         | -70% damage taken


### Body parts in a nice format:
```
MOVE	        50	
Decreases fatigue by 2 points per tick.

WORK	        100	
2 energy from source per tick
1 mineral from deposit per tick
Builds structure 5 energy per tick
Repairs structure 100 hits per tick, using 1 energy per tick
Dismantles structure 50 hits per tick, giving 0.25 energy per tick
Upgrades controller 1 energy per tick

CARRY	        50	
50 resource space

ATTACK	        80	
30 hits per tick

RANGED_ATTACK	150	
1-4-10 hits per tick, up to 3 squares away
Not sure if closer or further does more damage

HEAL	        250	
Restores 12 hits per tick
4 hits per tick at distance

CLAIM	        600	
Reserves 1 tick on unclaimed controller
Downgrades timer 300 ticks on hostile controller
Removes 1 tick on unclaimed controller

TOUGH	        10
No affect, just for hit points
```

## Setup
Run `npm install` to get packages

Replace `declare const Memory: Memory;` with `declare const Memory: any;`    
Because that causes issues with my memory system

Run `npm start` to compile

Push to master to release