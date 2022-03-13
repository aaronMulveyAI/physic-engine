package com.darkmop.course;

import com.darkmop.util.Vec2D;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

// TODO: if too slow, use java compiler api
public class MathExpression {
	String code;
	ScriptEngineManager manager;
	ScriptEngine engine;

	public MathExpression(String code) {
		this.code = "z=" + code;
		manager = new ScriptEngineManager();
		engine = manager.getEngineByExtension("js");
	}

	public double eval(Vec2D pos) {
		engine.put("x", pos.getX());
		engine.put("y", pos.getY());

		try {
			engine.eval(code);
		} catch (ScriptException e) {
			System.out.println("Could not run function " + code);
		}

		return (double)engine.get("z");
	}

	//start now

	@Override
	public String toString() {
		return "MathExpression{" + code + "}";
	}
}
