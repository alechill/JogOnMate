/**
 * JogOnMate
 *
 * Javascript logging 
 *
 * @author Alec Hill
 * @license MIT License
 */
var Jogger = (function(){
	
	var _instances = {},
		_masterLevel = 0,
		_log = [],
		_levels = ['all', 'trace', 'log', 'debug', 'info', 'warn', 'error', 'fatal', 'none'],
		_i = 0,
		_len;

	function Logger(name, level, target){
		this.setName(name);
		// default to NONE
		this.setLevel(Jogger.NONE);
		this.setLevel(level);
		this.setTarget(target);
	}
	
	Logger.prototype = {
		
		name: 'Jogger',
		
		level: 8,
		
		target: { 
			output: function(){} 
		},
		
		setName: function(value){
			if(value != undefined) this.name = value;
		},
		
		setLevel: function(value){
			if(value != undefined) this.level = value;
		},
		
		setTarget: function(value){
			if(value != undefined) this.target = value;
		},
		
		doLog: function(level, output){
			var timestamp = new Date().valueOf();
			// cant log if none passed
			if(level < Jogger.NONE){
				// only log if Jogger is set up to be this level
				if(level >= this.level && level >= _masterLevel){
					// dont log a trace
					if(level === Jogger.TRACE){
						// always use console target to trace as meaningless anywhere else
						Jogger.ConsoleTarget.output(level, this.name, output, timestamp);
					}else{
						// add to running log
						_log.push({
							name: this.name,
							level: level,
							output: output,
							timestamp: timestamp
						});
						// output to target
						if(this.target && this.target.output){
							this.target.output(level, this.name, output, timestamp);
						}
					}
				}
			}
		}
		
	};
	
	// add convenience methods for loggable levels
	for(_i = 0, _len = _levels.length; _i < _len; _i++){
		if(_levels[_i] != 'all' && _levels[_i] != 'none'){
			Logger.prototype[_levels[_i]] = (function(level){
				return function(output){
					Logger.prototype.doLog.call( this, Jogger[level], output);
				}
			})(_levels[_i].toUpperCase());
		}
	};
	
	return { 
		
		isInstance: function(subject){
			return subject instanceof Logger;
		},
		
		getLogger: function(name, level, target){
			if(!_instances[name]){
				_instances[name] = new Logger(name, level, target);
			}
			return _instances[name];
		},
		
		getLog: function(){
			return _log;
		},
		
		getMasterLevel: function(){
			return _masterLevel;
		},
		
		setMasterLevel: function(level){
			_masterLevel = level;
		},
		
		ALL: 0,
		TRACE: 1,
		LOG: 2,
		DEBUG: 3,
		INFO: 4,
		WARN: 5,
		ERROR: 6,
		FATAL: 7,
		NONE: 8,
		
		// TARGETS...
		
		ConsoleTarget: {
			output: function(level, name, msg, timestamp){
				var level_str = _levels[level],
					do_trace = false,
					can_output = msg == undefined || typeof msg == 'string' || typeof msg == 'boolean' || typeof msg == 'number',
					date = new Date(timestamp);
				// can't output an ALL or NONE
				if(level === Jogger.ALL || level === Jogger.NONE){
					return;
				}
				// console does not know what fatal is, so output as error
				if(level === Jogger.FATAL){
					level = Jogger.ERROR;
				}else if(level == Jogger.TRACE){
					// we want to output some details around the trace so log that out
					level = Jogger.LOG;
					do_trace = true;
				}
				if(window['console'] && window.console[_levels[level]]){
					window.console[_levels[level]]( date.toTimeString().split(' ')[0] + ' [' + level_str.toUpperCase() + '] ' + '[' + name + ']' + (can_output ? ' \n' + msg : '...') );
					if( !can_output ){ 
						window.console[_levels[level]](msg);
					}
					// do a trace if necessary
					if( do_trace && window.console['trace'] ){
						window.console.trace();
					}
				}
			}
		},
		
		AlertTarget: {
			output: function(level, name, msg, timestamp){
				var level_str = _levels[level],
					date = new Date(timestamp);
				// can't output an ALL or NONE
				if(level === Jogger.ALL || level === Jogger.NONE){
					return;
				}
				alert( date.toTimeString().split(' ')[0] + ' [' + level_str.toUpperCase() + '] ' + '[' + name + '] :\n' + msg );
			}
		}

	}
	
})();

/*
// examples
var a = Jogger.getLogger('logger_a', Jogger.WARN, Jogger.ConsoleTarget);
var b = Jogger.getLogger('logger_b', Jogger.TRACE, Jogger.ConsoleTarget);


a.log('hello');
a.debug(3);
a.info({'hello':'there'});
a.warn('warning');
a.error('boom');
a.fatal('arrrrgh');


b.log({'hi':'there'});
b.debug([1,2,3,4,'five',{'six':6}]);
b.info(3);
b.warn('careful');
b.error('bang');
b.fatal('bluurrrrgh');

b.trace('tracey');

b.debug(null);
b.debug(undefined);

Jogger.setMasterLevel(Jogger.ERROR);

b.log('should not see me');
b.debug('should not see me');
b.info('should not see me');
b.warn('should not see me');
b.error('should fear me');
b.fatal('should be terrified by me');
*/