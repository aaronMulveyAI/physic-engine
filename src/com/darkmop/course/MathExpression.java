package com.darkmop.course;

import com.darkmop.util.Vec2D;

import java.util.Locale;

public class MathExpression {
	String code;

	public MathExpression(String code) {
		this.code = code;
	}

	public double eval(Vec2D pos) {
		return new Parser(code, pos).parse();
	}

	@Override
	public String toString() {
		return "MathExpression{" + code + "}";
	}

	private static class Parser {
		private final String input;
		private final Vec2D pos;
		private int index = 0;

		Parser(String input, Vec2D pos) {
			this.input = input;
			this.pos = pos;
		}

		double parse() {
			double value = parseExpression();
			skipWhitespace();
			if(index != input.length()) {
				throw new IllegalArgumentException("Unexpected token at position " + index + " in " + input);
			}
			return value;
		}

		private double parseExpression() {
			double value = parseTerm();

			while(true) {
				skipWhitespace();
				if(match('+')) {
					value += parseTerm();
				} else if(match('-')) {
					value -= parseTerm();
				} else {
					return value;
				}
			}
		}

		private double parseTerm() {
			double value = parsePower();

			while(true) {
				skipWhitespace();
				if(match('*')) {
					value *= parsePower();
				} else if(match('/')) {
					value /= parsePower();
				} else {
					return value;
				}
			}
		}

		private double parsePower() {
			double value = parseUnary();
			skipWhitespace();
			if(match('^')) {
				value = Math.pow(value, parsePower());
			}
			return value;
		}

		private double parseUnary() {
			skipWhitespace();
			if(match('+')) {
				return parseUnary();
			}
			if(match('-')) {
				return -parseUnary();
			}
			return parsePrimary();
		}

		private double parsePrimary() {
			skipWhitespace();
			if(match('(')) {
				double value = parseExpression();
				expect(')');
				return value;
			}

			if(isIdentifierStart(peek())) {
				String identifier = parseIdentifier();
				if(identifier.equals("x")) {
					return pos.getX();
				}
				if(identifier.equals("y")) {
					return pos.getY();
				}
				if(identifier.equals("pi") || identifier.equals("Math.PI")) {
					return Math.PI;
				}
				if(identifier.equals("e") || identifier.equals("Math.E")) {
					return Math.E;
				}

				expect('(');
				double first = parseExpression();
				Double second = null;
				skipWhitespace();
				if(match(',')) {
					second = parseExpression();
				}
				expect(')');
				return evaluateFunction(identifier, first, second);
			}

			return parseNumber();
		}

		private double evaluateFunction(String name, double first, Double second) {
			String normalized = name.toLowerCase(Locale.ROOT);
			if(normalized.startsWith("math.")) {
				normalized = normalized.substring("math.".length());
			}

			switch(normalized) {
				case "sin":
					return Math.sin(first);
				case "cos":
					return Math.cos(first);
				case "tan":
					return Math.tan(first);
				case "asin":
					return Math.asin(first);
				case "acos":
					return Math.acos(first);
				case "atan":
					return Math.atan(first);
				case "sqrt":
					return Math.sqrt(first);
				case "abs":
					return Math.abs(first);
				case "log":
					return Math.log(first);
				case "log10":
					return Math.log10(first);
				case "exp":
					return Math.exp(first);
				case "pow":
					if(second == null) {
						throw new IllegalArgumentException("pow requires two arguments");
					}
					return Math.pow(first, second);
				case "min":
					if(second == null) {
						throw new IllegalArgumentException("min requires two arguments");
					}
					return Math.min(first, second);
				case "max":
					if(second == null) {
						throw new IllegalArgumentException("max requires two arguments");
					}
					return Math.max(first, second);
				default:
					throw new IllegalArgumentException("Unknown function " + name);
			}
		}

		private double parseNumber() {
			int start = index;
			while(index < input.length()) {
				char current = input.charAt(index);
				if(Character.isDigit(current) || current == '.') {
					index++;
				} else {
					break;
				}
			}

			if(index < input.length() && (input.charAt(index) == 'e' || input.charAt(index) == 'E')) {
				index++;
				if(index < input.length() && (input.charAt(index) == '+' || input.charAt(index) == '-')) {
					index++;
				}
				while(index < input.length() && Character.isDigit(input.charAt(index))) {
					index++;
				}
			}

			if(start == index) {
				throw new IllegalArgumentException("Expected number at position " + index + " in " + input);
			}

			return Double.parseDouble(input.substring(start, index));
		}

		private String parseIdentifier() {
			int start = index;
			while(index < input.length()) {
				char current = input.charAt(index);
				if(Character.isLetterOrDigit(current) || current == '_' || current == '.') {
					index++;
				} else {
					break;
				}
			}
			return input.substring(start, index);
		}

		private boolean isIdentifierStart(char current) {
			return Character.isLetter(current) || current == '_';
		}

		private char peek() {
			if(index >= input.length()) {
				return '\0';
			}
			return input.charAt(index);
		}

		private boolean match(char expected) {
			skipWhitespace();
			if(index < input.length() && input.charAt(index) == expected) {
				index++;
				return true;
			}
			return false;
		}

		private void expect(char expected) {
			if(!match(expected)) {
				throw new IllegalArgumentException("Expected '" + expected + "' at position " + index + " in " + input);
			}
		}

		private void skipWhitespace() {
			while(index < input.length() && Character.isWhitespace(input.charAt(index))) {
				index++;
			}
		}
	}
}
