import React, { useState } from 'react';
import { Utensils, AlertTriangle, Droplets, ChevronDown, Check, X as XIcon } from 'lucide-react';
import { SectionTitle, Card, Pill } from '../../components/ui';
import { mouthRinseRecipes, avoidInMouth, foodRecipes, neutropeniaRules, hydrationIdeas } from '../../data/recipes';

export default function Nutrition() {
  const [openRecipe, setOpenRecipe] = useState(null);
  const [activeTab, setActiveTab] = useState('food');

  const tabs = [
    { id: 'food', label: 'Recetas nutritivas', icon: Utensils },
    { id: 'mouth', label: 'Cuidado bucal', icon: Droplets },
    { id: 'neutro', label: 'Reglas neutropenia', icon: AlertTriangle },
    { id: 'hydration', label: 'Hidratación', icon: Droplets },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionTitle subtitle="Recetas terapéuticas, enjuagues y guías de alimentación segura para cada fase del tratamiento de Roro.">
        Soporte nutricional
      </SectionTitle>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Food Recipes */}
      {activeTab === 'food' && (
        <div className="space-y-3">
          {foodRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} isOpen={openRecipe === recipe.id} onToggle={() => setOpenRecipe(openRecipe === recipe.id ? null : recipe.id)} />
          ))}
        </div>
      )}

      {/* Mouth Care */}
      {activeTab === 'mouth' && (
        <div className="space-y-4">
          <Card tone="info">
            <p className="text-sm text-sky-900">
              <strong>Protocolo:</strong> 4-6 enjuagues al día. El de bicarbonato es el obligatorio. Los demás son complementarios.
            </p>
          </Card>

          <div className="space-y-3">
            {mouthRinseRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} isOpen={openRecipe === recipe.id} onToggle={() => setOpenRecipe(openRecipe === recipe.id ? null : recipe.id)} />
            ))}
          </div>

          <Card tone="critical">
            <h3 className="text-sm font-bold text-rose-900 mb-2 flex items-center gap-2">
              <XIcon className="w-4 h-4" /> NUNCA usar en la boca
            </h3>
            <ul className="space-y-1.5">
              {avoidInMouth.map((item, i) => (
                <li key={i} className="text-sm text-rose-800 flex items-start gap-2">
                  <XIcon className="w-3.5 h-3.5 text-rose-500 flex-none mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Neutropenia Rules */}
      {activeTab === 'neutro' && (
        <div className="space-y-3">
          <Card tone="warn">
            <p className="text-sm text-amber-900">
              <strong>Neutropenia</strong> = defensas muy bajas. Estas reglas aplican especialmente del día 7 al 14 después de cada ciclo de quimioterapia.
            </p>
          </Card>
          {neutropeniaRules.map((rule, i) => (
            <Card key={i}>
              <h4 className="text-sm font-semibold text-stone-900 mb-3">{rule.rule}</h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-emerald-700 mb-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> SÍ se puede
                  </p>
                  <p className="text-sm text-emerald-900">{rule.ok}</p>
                </div>
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-rose-700 mb-1 flex items-center gap-1">
                    <XIcon className="w-3 h-3" /> EVITAR
                  </p>
                  <p className="text-sm text-rose-900">{rule.avoid}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Hydration */}
      {activeTab === 'hydration' && (
        <div className="grid sm:grid-cols-2 gap-3">
          {hydrationIdeas.map((idea, i) => (
            <Card key={i}>
              <div className="flex items-start gap-2.5">
                <Droplets className="w-4 h-4 text-sky-500 flex-none mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-stone-900 mb-0.5">{idea.name}</p>
                  <p className="text-xs text-stone-600 mb-1">{idea.why}</p>
                  <p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded inline-block">
                    ⚠️ {idea.caution}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe, isOpen, onToggle }) {
  return (
    <Card className="!p-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-stone-50 transition-colors"
      >
        <Utensils className="w-4 h-4 text-sky-600 flex-none mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-stone-900">{recipe.name}</p>
          <p className="text-xs text-stone-500 mt-0.5">{recipe.phase || recipe.when}</p>
        </div>
        {recipe.nutrition && <Pill tone="info">{recipe.nutrition.split(',')[0]}</Pill>}
        <ChevronDown className={`w-4 h-4 text-stone-400 flex-none mt-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 pt-0 border-t border-stone-100 animate-fade-in">
          {recipe.why && (
            <div className="mb-3 mt-3">
              <p className="text-xs font-medium text-stone-500 uppercase mb-1">Por qué</p>
              <p className="text-sm text-stone-700 leading-relaxed">{recipe.why}</p>
            </div>
          )}
          {recipe.evidence && (
            <div className="mb-3 mt-3">
              <Pill tone="info">{recipe.evidence}</Pill>
            </div>
          )}
          <div className="mb-3">
            <p className="text-xs font-medium text-stone-500 uppercase mb-1">Ingredientes</p>
            <ul className="space-y-0.5">
              {recipe.ingredients.map((ing, j) => (
                <li key={j} className="text-sm text-stone-700 flex gap-2">
                  <span className="text-sky-400">•</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-3">
            <p className="text-xs font-medium text-stone-500 uppercase mb-1">Preparación</p>
            <p className="text-sm text-stone-700 leading-relaxed">{recipe.method}</p>
          </div>
          {recipe.caution && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2">
              <p className="text-xs text-amber-800">⚠️ {recipe.caution}</p>
            </div>
          )}
          {recipe.nutrition && (
            <p className="text-xs text-stone-500 mt-2 italic">📊 {recipe.nutrition}</p>
          )}
        </div>
      )}
    </Card>
  );
}
